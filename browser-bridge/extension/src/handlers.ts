import type { BridgeRequest } from "../../shared/protocol";
import {
  disableCdpSession,
  enableCdpSession,
  getCdpAttachedTabs,
  getCdpEvents,
  isCdpSessionActive,
  sendCdpCommand,
  type CdpEventType,
} from "./cdp-session";
import {
  cdpClickAt,
  cdpClickBySelector,
  cdpClickByText,
  clearExtensionErrors,
  findOverlayCandidates,
  reloadExtensionFromUI,
} from "./chrome-ui";
import { getRecentLogs } from "./logger";

type TabSummary = {
  id: number;
  windowId: number;
  index: number;
  active: boolean;
  pinned: boolean;
  audible: boolean;
  muted: boolean;
  url?: string;
  title?: string;
  favIconUrl?: string;
  status?: string;
};

type PageConsoleLog = { level: string; message: string; timestamp: number };

function tabSummary(tab: chrome.tabs.Tab): TabSummary {
  return {
    id: tab.id!,
    windowId: tab.windowId,
    index: tab.index,
    active: tab.active,
    pinned: tab.pinned,
    audible: tab.audible ?? false,
    muted: tab.mutedInfo?.muted ?? false,
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
    status: tab.status,
  };
}

async function requireTabId(tabId: unknown): Promise<number> {
  if (typeof tabId === "number" && Number.isInteger(tabId)) return tabId;
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!active?.id) throw new Error("No active tab found");
  return active.id;
}

async function getTabConsoleLogs(
  tabId: number,
): Promise<{ logs: PageConsoleLog[] } | { error: string }> {
  try {
    const response = (await chrome.tabs.sendMessage(tabId, { type: "getConsoleLogs" })) as
      | { logs?: PageConsoleLog[] }
      | undefined;
    return { logs: response?.logs ?? [] };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

async function findOrOpenExtensionsTab(): Promise<number> {
  const extensionId = chrome.runtime.id;
  const targetUrl = `chrome://extensions/?id=${extensionId}`;
  const existing = await chrome.tabs.query({ url: "chrome://extensions/*" });
  if (existing[0]?.id) {
    await chrome.tabs.update(existing[0].id, { active: true, url: targetUrl });
    return existing[0].id;
  }
  const tab = await chrome.tabs.create({ url: targetUrl, active: true });
  if (!tab.id) throw new Error("Failed to open chrome://extensions");
  return tab.id;
}

async function executeInTab<T extends unknown[]>(
  tabId: number,
  func: (...args: T) => unknown,
  args: T,
) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func,
    args,
    world: "MAIN",
  });
  return result.result;
}

export async function handleBridgeRequest(request: BridgeRequest): Promise<unknown> {
  const params = request.params ?? {};

  switch (request.method) {
    case "bridge.ping":
      return { pong: true, timestamp: Date.now() };

    case "bridge.status":
      return {
        connected: true,
        debuggerAttached: getCdpAttachedTabs(),
        version: chrome.runtime.getManifest().version,
      };

    case "bridge.logs": {
      const limit =
        typeof params.limit === "number" && Number.isInteger(params.limit)
          ? Math.min(Math.max(params.limit, 1), 200)
          : 50;
      return { logs: getRecentLogs(limit) };
    }

    case "tabs.list": {
      const query = (params.query as chrome.tabs.QueryInfo | undefined) ?? {};
      const tabs = await chrome.tabs.query(query);
      return tabs.map(tabSummary);
    }

    case "tabs.get": {
      const tab = await chrome.tabs.get(await requireTabId(params.tabId));
      return tabSummary(tab);
    }

    case "tabs.create": {
      const tab = await chrome.tabs.create({
        url: typeof params.url === "string" ? params.url : undefined,
        active: params.active !== false,
        pinned: params.pinned === true,
      });
      return tabSummary(tab);
    }

    case "tabs.close": {
      const tabId = await requireTabId(params.tabId);
      await disableCdpSession(tabId);
      await chrome.tabs.remove(tabId);
      return { closed: tabId };
    }

    case "tabs.activate": {
      const tabId = await requireTabId(params.tabId);
      const tab = await chrome.tabs.get(tabId);
      await chrome.tabs.update(tabId, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      return tabSummary(await chrome.tabs.get(tabId));
    }

    case "tabs.navigate": {
      const tabId = await requireTabId(params.tabId);
      const url = params.url;
      if (typeof url !== "string") throw new Error("url is required");
      const tab = await chrome.tabs.update(tabId, { url });
      return tabSummary(tab!);
    }

    case "tabs.reload": {
      const tabId = await requireTabId(params.tabId);
      await chrome.tabs.reload(tabId, {
        bypassCache: params.bypassCache === true,
      });
      return { reloaded: tabId };
    }

    case "tabs.screenshot": {
      const tabId = await requireTabId(params.tabId);
      const tab = await chrome.tabs.get(tabId);
      await chrome.windows.update(tab.windowId, { focused: true });
      await chrome.tabs.update(tabId, { active: true });
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
        format: (params.format as "png" | "jpeg") ?? "png",
        quality: typeof params.quality === "number" ? params.quality : undefined,
      });
      return { dataUrl, tabId };
    }

    case "scripting.execute": {
      const tabId = await requireTabId(params.tabId);
      const expression = params.expression;
      if (typeof expression !== "string") throw new Error("expression is required");
      const result = await executeInTab(
        tabId,
        (code: string) => {
          // eslint-disable-next-line no-eval
          return eval(code);
        },
        [expression],
      );
      return { result };
    }

    case "dom.snapshot": {
      const tabId = await requireTabId(params.tabId);
      const tree = await sendCdpCommand(tabId, "Accessibility.getFullAXTree");
      return tree;
    }

    case "dom.query": {
      const tabId = await requireTabId(params.tabId);
      const selector = params.selector;
      if (typeof selector !== "string") throw new Error("selector is required");
      const nodes = await executeInTab(
        tabId,
        (sel: string) => {
          const elements = [...document.querySelectorAll(sel)];
          return elements.map((el, index) => ({
            index,
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            className: el.className || null,
            text: (el.textContent ?? "").trim().slice(0, 200),
            rect: (() => {
              const r = el.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top, left: r.left };
            })(),
            visible: (el as HTMLElement).offsetParent !== null,
            value: (el as HTMLInputElement).value ?? null,
            href: (el as HTMLAnchorElement).href ?? null,
          }));
        },
        [selector],
      );
      return { nodes };
    }

    case "interaction.click": {
      const tabId = await requireTabId(params.tabId);
      const selector = params.selector;
      if (typeof selector !== "string") throw new Error("selector is required");
      await executeInTab(
        tabId,
        (sel: string) => {
          const el = document.querySelector(sel);
          if (!el) throw new Error(`Element not found: ${sel}`);
          (el as HTMLElement).click();
          return true;
        },
        [selector],
      );
      return { clicked: selector };
    }

    case "interaction.fill": {
      const tabId = await requireTabId(params.tabId);
      const selector = params.selector;
      const value = params.value;
      if (typeof selector !== "string") throw new Error("selector is required");
      if (typeof value !== "string") throw new Error("value is required");

      const kind = await executeInTab(
        tabId,
        (sel: string) => {
          const el = document.querySelector(sel);
          if (!el) throw new Error(`Element not found: ${sel}`);
          const target = el as HTMLElement;
          if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            return "input";
          }
          if (target.isContentEditable) {
            return "contenteditable";
          }
          throw new Error(`Element is not fillable: ${sel}`);
        },
        [selector],
      );

      if (kind === "input") {
        await executeInTab(
          tabId,
          (sel: string, val: string) => {
            const el = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement;
            el.focus();
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
            return true;
          },
          [selector, value],
        );
      } else {
        await executeInTab(
          tabId,
          (sel: string) => {
            const el = document.querySelector(sel) as HTMLElement;
            el.focus();
            const doc = el.ownerDocument;
            const selection = doc.getSelection();
            const range = doc.createRange();
            range.selectNodeContents(el);
            selection?.removeAllRanges();
            selection?.addRange(range);
            return true;
          },
          [selector],
        );
        await sendCdpCommand(tabId, "Input.insertText", { text: value });
      }

      return { filled: selector };
    }

    case "interaction.press": {
      const tabId = await requireTabId(params.tabId);
      const key = params.key;
      if (typeof key !== "string") throw new Error("key is required");
      await executeInTab(
        tabId,
        (keyName: string) => {
          const target = document.activeElement ?? document.body;
          target.dispatchEvent(
            new KeyboardEvent("keydown", { key: keyName, bubbles: true, cancelable: true }),
          );
          target.dispatchEvent(
            new KeyboardEvent("keyup", { key: keyName, bubbles: true, cancelable: true }),
          );
          return true;
        },
        [key],
      );
      return { pressed: key };
    }

    case "interaction.scroll": {
      const tabId = await requireTabId(params.tabId);
      const x = typeof params.x === "number" ? params.x : 0;
      const y = typeof params.y === "number" ? params.y : 0;
      const selector = typeof params.selector === "string" ? params.selector : null;
      await executeInTab(
        tabId,
        (scrollX: number, scrollY: number, sel: string | null) => {
          const target = sel ? document.querySelector(sel) : null;
          if (target) target.scrollIntoView({ behavior: "instant", block: "center" });
          else window.scrollBy(scrollX, scrollY);
          return { scrollX: window.scrollX, scrollY: window.scrollY };
        },
        [x, y, selector],
      );
      return { scrolled: true };
    }

    case "interaction.hover": {
      const tabId = await requireTabId(params.tabId);
      const selector = params.selector;
      if (typeof selector !== "string") throw new Error("selector is required");
      await executeInTab(
        tabId,
        (sel: string) => {
          const el = document.querySelector(sel);
          if (!el) throw new Error(`Element not found: ${sel}`);
          el.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
          el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
          return true;
        },
        [selector],
      );
      return { hovered: selector };
    }

    case "debugger.attach": {
      const tabId = await requireTabId(params.tabId);
      await sendCdpCommand(tabId, "Runtime.enable");
      return { attached: tabId };
    }

    case "debugger.detach": {
      const tabId = await requireTabId(params.tabId);
      await disableCdpSession(tabId);
      return { detached: tabId };
    }

    case "debugger.sendCommand": {
      const tabId = await requireTabId(params.tabId);
      const method = params.method;
      if (typeof method !== "string") throw new Error("method is required");
      const commandParams = (params.params as Record<string, unknown> | undefined) ?? {};
      const result = await sendCdpCommand(tabId, method, commandParams);
      return { result };
    }

    case "console.get": {
      const tabId = await requireTabId(params.tabId);
      const limit =
        typeof params.limit === "number" && Number.isInteger(params.limit)
          ? Math.min(Math.max(params.limit, 1), 500)
          : 100;
      const result = await getTabConsoleLogs(tabId);
      if ("error" in result) return { tabId, error: result.error, logs: [] };
      return { tabId, logs: result.logs.slice(-limit) };
    }

    case "console.batch": {
      const limit =
        typeof params.limit === "number" && Number.isInteger(params.limit)
          ? Math.min(Math.max(params.limit, 1), 500)
          : 100;
      const query = (params.query as chrome.tabs.QueryInfo | undefined) ?? {};
      const tabs = await chrome.tabs.query(query);
      const results = await Promise.all(
        tabs.map(async (tab) => {
          if (!tab.id) return null;
          const consoleResult = await getTabConsoleLogs(tab.id);
          return {
            tab: tabSummary(tab),
            ...("error" in consoleResult
              ? { error: consoleResult.error, logs: [] }
              : { logs: consoleResult.logs.slice(-limit) }),
          };
        }),
      );
      return { tabs: results.filter(Boolean) };
    }

    case "observability.enable": {
      const tabId = await requireTabId(params.tabId);
      const domains = Array.isArray(params.domains)
        ? (params.domains as string[])
        : ["Runtime", "Network", "Log"];
      return enableCdpSession(tabId, domains);
    }

    case "observability.get": {
      const tabId = await requireTabId(params.tabId);
      const types = Array.isArray(params.types) ? (params.types as CdpEventType[]) : undefined;
      const limit =
        typeof params.limit === "number" && Number.isInteger(params.limit)
          ? Math.min(Math.max(params.limit, 1), 500)
          : 100;
      const since = typeof params.since === "number" ? params.since : undefined;
      const pageConsole = await getTabConsoleLogs(tabId);
      return {
        tabId,
        cdpActive: isCdpSessionActive(tabId),
        cdpEvents: getCdpEvents(tabId, { types, limit, since }),
        pageConsole: "error" in pageConsole ? { error: pageConsole.error } : { logs: pageConsole.logs },
      };
    }

    case "observability.disable": {
      const tabId = await requireTabId(params.tabId);
      return disableCdpSession(tabId);
    }

    case "observability.batch": {
      const limit =
        typeof params.limit === "number" && Number.isInteger(params.limit)
          ? Math.min(Math.max(params.limit, 1), 500)
          : 50;
      const includeNetwork = params.includeNetwork !== false;
      const includeConsole = params.includeConsole !== false;
      const includeAccessibility = params.includeAccessibility === true;
      const tabIds = Array.isArray(params.tabIds) ? (params.tabIds as number[]) : undefined;

      let tabs = await chrome.tabs.query({});
      if (tabIds?.length) {
        const idSet = new Set(tabIds);
        tabs = tabs.filter((t) => t.id && idSet.has(t.id));
      }

      const results = await Promise.all(
        tabs.map(async (tab) => {
          if (!tab.id) return null;
          const tabId = tab.id;
          const entry: Record<string, unknown> = { tab: tabSummary(tab) };

          if (includeConsole) {
            const pageConsole = await getTabConsoleLogs(tabId);
            entry.pageConsole =
              "error" in pageConsole
                ? { error: pageConsole.error }
                : { logs: pageConsole.logs.slice(-limit) };
          }

          if (includeNetwork && !isCdpSessionActive(tabId)) {
            try {
              await enableCdpSession(tabId);
            } catch (error) {
              entry.cdpError = error instanceof Error ? error.message : String(error);
            }
          }

          if (includeNetwork || isCdpSessionActive(tabId)) {
            entry.cdpEvents = getCdpEvents(tabId, { limit });
          }

          if (includeAccessibility) {
            try {
              entry.accessibility = await sendCdpCommand(tabId, "Accessibility.getFullAXTree");
            } catch (error) {
              entry.accessibilityError = error instanceof Error ? error.message : String(error);
            }
          }

          return entry;
        }),
      );

      return { tabs: results.filter(Boolean) };
    }

    case "extension.getInfo": {
      const manifest = chrome.runtime.getManifest();
      return {
        id: chrome.runtime.id,
        name: manifest.name,
        version: manifest.version,
      };
    }

    case "extension.openSettings": {
      const tabId = await findOrOpenExtensionsTab();
      await new Promise((r) => setTimeout(r, 500));
      return { tabId, url: `chrome://extensions/?id=${chrome.runtime.id}` };
    }

    case "extension.reload": {
      setTimeout(() => chrome.runtime.reload(), 250);
      return { reloading: true, deferredMs: 250 };
    }

    case "extension.clearErrors": {
      const tabId = await findOrOpenExtensionsTab();
      await new Promise((r) => setTimeout(r, 800));
      try {
        const result = await clearExtensionErrors(tabId, chrome.runtime.id);
        return { tabId, ...result };
      } catch (error) {
        return {
          tabId,
          cleared: false,
          steps: [],
          error: error instanceof Error ? error.message : String(error),
          note: "CDP cannot attach to chrome:// pages; reloading the extension clears service worker errors.",
        };
      }
    }

    case "extension.reloadFromUI": {
      const tabId = await findOrOpenExtensionsTab();
      await new Promise((r) => setTimeout(r, 500));
      const extensionId = chrome.runtime.id;
      setTimeout(() => {
        void reloadExtensionFromUI(tabId, extensionId);
      }, 300);
      return { tabId, scheduled: true, deferredMs: 300 };
    }

    case "overlay.find": {
      const tabId = await requireTabId(params.tabId);
      const text = typeof params.text === "string" ? params.text : undefined;
      const keywords = Array.isArray(params.keywords) ? (params.keywords as string[]) : undefined;
      const candidates = await findOverlayCandidates(tabId, { text, keywords });
      return { tabId, candidates };
    }

    case "overlay.click": {
      const tabId = await requireTabId(params.tabId);
      if (typeof params.x === "number" && typeof params.y === "number") {
        await cdpClickAt(tabId, params.x, params.y);
        return { clicked: true, method: "coordinates", x: params.x, y: params.y };
      }
      if (typeof params.selector === "string") {
        const result = await cdpClickBySelector(tabId, params.selector);
        return { tabId, ...result, method: "selector" };
      }
      if (typeof params.text === "string") {
        const result = await cdpClickByText(tabId, params.text);
        return { tabId, ...result, method: "text" };
      }
      throw new Error("overlay.click requires x/y, selector, or text");
    }

    case "cookies.get": {
      const url = params.url;
      if (typeof url !== "string") throw new Error("url is required");
      const cookies = await chrome.cookies.getAll({ url, name: params.name as string | undefined });
      return { cookies };
    }

    case "cookies.set": {
      const url = params.url;
      const name = params.name;
      const value = params.value;
      if (typeof url !== "string" || typeof name !== "string" || typeof value !== "string") {
        throw new Error("url, name, and value are required");
      }
      const cookie = await chrome.cookies.set({
        url,
        name,
        value,
        domain: params.domain as string | undefined,
        path: (params.path as string | undefined) ?? "/",
        secure: params.secure as boolean | undefined,
        httpOnly: params.httpOnly as boolean | undefined,
        sameSite: params.sameSite as chrome.cookies.SameSiteStatus | undefined,
        expirationDate: params.expirationDate as number | undefined,
      });
      return { cookie };
    }

    case "cookies.remove": {
      const url = params.url;
      const name = params.name;
      if (typeof url !== "string" || typeof name !== "string") {
        throw new Error("url and name are required");
      }
      const details = await chrome.cookies.remove({ url, name });
      return { details };
    }

    case "storage.local.get": {
      const keys = params.keys as string | string[] | undefined;
      return chrome.storage.local.get(keys);
    }

    case "storage.local.set": {
      const items = params.items as Record<string, unknown> | undefined;
      if (!items) throw new Error("items is required");
      await chrome.storage.local.set(items);
      return { saved: true };
    }

    case "downloads.search": {
      const query = (params.query as chrome.downloads.DownloadQuery | undefined) ?? {};
      const downloads = await chrome.downloads.search(query);
      return { downloads };
    }

    case "clipboard.read": {
      const tabId = await requireTabId(params.tabId);
      const text = await executeInTab(tabId, () => navigator.clipboard.readText(), []);
      return { text };
    }

    case "clipboard.write": {
      const tabId = await requireTabId(params.tabId);
      const text = params.text;
      if (typeof text !== "string") throw new Error("text is required");
      await executeInTab(
        tabId,
        (value: string) => {
          void navigator.clipboard.writeText(value);
          return true;
        },
        [text],
      );
      return { written: true };
    }

    default:
      throw new Error(`Unknown method: ${request.method}`);
  }
}
