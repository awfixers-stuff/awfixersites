import type { BridgeRequest } from "../../shared/protocol";

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

const debuggerAttached = new Set<number>();
const consoleLogs = new Map<number, Array<{ level: string; message: string; timestamp: number }>>();

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

async function ensureDebugger(tabId: number): Promise<void> {
  if (debuggerAttached.has(tabId)) return;
  await chrome.debugger.attach({ tabId }, "1.3");
  debuggerAttached.add(tabId);
}

async function sendDebuggerCommand(
  tabId: number,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  await ensureDebugger(tabId);
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, method, params ?? {}, (result) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(result);
    });
  });
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
        debuggerAttached: [...debuggerAttached],
        version: chrome.runtime.getManifest().version,
      };

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
      await chrome.tabs.remove(tabId);
      debuggerAttached.delete(tabId);
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
      const tree = await sendDebuggerCommand(tabId, "Accessibility.getFullAXTree");
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
        await sendDebuggerCommand(tabId, "Input.insertText", { text: value });
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
      await ensureDebugger(tabId);
      return { attached: tabId };
    }

    case "debugger.detach": {
      const tabId = await requireTabId(params.tabId);
      if (debuggerAttached.has(tabId)) {
        await chrome.debugger.detach({ tabId });
        debuggerAttached.delete(tabId);
      }
      return { detached: tabId };
    }

    case "debugger.sendCommand": {
      const tabId = await requireTabId(params.tabId);
      const method = params.method;
      if (typeof method !== "string") throw new Error("method is required");
      const commandParams = (params.params as Record<string, unknown> | undefined) ?? {};
      const result = await sendDebuggerCommand(tabId, method, commandParams);
      return { result };
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

chrome.debugger.onDetach.addListener((source, reason) => {
  if (source.tabId) debuggerAttached.delete(source.tabId);
  console.warn("[browser-bridge] debugger detached", source.tabId, reason);
});

export function getConsoleLogs(tabId: number) {
  return consoleLogs.get(tabId) ?? [];
}
