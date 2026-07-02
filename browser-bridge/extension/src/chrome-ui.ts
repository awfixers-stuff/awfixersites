import { sendCdpCommand } from "./cdp-session";

const DEEP_QUERY_FN = `
function __deepQuery(root, selector, text) {
  const matches = [];
  function walk(node) {
    if (!node) return;
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node;
      let matched = false;
      if (selector) {
        try { if (el.matches(selector)) matched = true; } catch {}
      }
      if (!matched && text) {
        const label = (el.innerText || el.textContent || el.getAttribute("aria-label") || "").trim();
        if (label.toLowerCase().includes(text.toLowerCase())) matched = true;
      }
      if (matched) {
        const r = el.getBoundingClientRect();
        matches.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: el.className || null,
          text: (el.innerText || el.textContent || "").trim().slice(0, 200),
          rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        });
      }
      if (el.shadowRoot) walk(el.shadowRoot);
      for (const child of el.children) walk(child);
    }
  }
  walk(root);
  return matches;
}
`;

export type UiCandidate = {
  tag: string;
  id: string | null;
  className: string | null;
  text: string;
  rect: { x: number; y: number; width: number; height: number };
};

export async function cdpDeepQuery(
  tabId: number,
  options: { selector?: string; text?: string } = {},
): Promise<UiCandidate[]> {
  const selector = options.selector ?? null;
  const text = options.text ?? null;
  const expression = `(() => { ${DEEP_QUERY_FN}; return __deepQuery(document, ${JSON.stringify(selector)}, ${JSON.stringify(text)}); })()`;
  const result = (await sendCdpCommand(tabId, "Runtime.evaluate", {
    expression,
    returnByValue: true,
  })) as { result?: { value?: UiCandidate[] } };
  return result?.result?.value ?? [];
}

export async function cdpClickAt(tabId: number, x: number, y: number): Promise<void> {
  await sendCdpCommand(tabId, "Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await sendCdpCommand(tabId, "Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
}

export async function cdpClickCandidate(tabId: number, candidate: UiCandidate): Promise<void> {
  const x = candidate.rect.x + candidate.rect.width / 2;
  const y = candidate.rect.y + candidate.rect.height / 2;
  await cdpClickAt(tabId, x, y);
}

export async function cdpClickBySelector(
  tabId: number,
  selector: string,
): Promise<{ clicked: boolean; candidate?: UiCandidate }> {
  const candidates = await cdpDeepQuery(tabId, { selector });
  if (!candidates.length) return { clicked: false };
  await cdpClickCandidate(tabId, candidates[0]!);
  return { clicked: true, candidate: candidates[0] };
}

export async function cdpClickByText(
  tabId: number,
  text: string,
): Promise<{ clicked: boolean; candidate?: UiCandidate }> {
  const candidates = await cdpDeepQuery(tabId, { text });
  if (!candidates.length) return { clicked: false };
  await cdpClickCandidate(tabId, candidates[0]!);
  return { clicked: true, candidate: candidates[0] };
}

const ONEPASSWORD_KEYWORDS = ["1password", "unlock", "save login", "save item", "com-1password"];

export async function findOverlayCandidates(
  tabId: number,
  options: { text?: string; keywords?: string[] } = {},
): Promise<UiCandidate[]> {
  const keywords = options.text
    ? [options.text]
    : (options.keywords ?? ONEPASSWORD_KEYWORDS);
  const seen = new Set<string>();
  const results: UiCandidate[] = [];

  for (const keyword of keywords) {
    const matches = await cdpDeepQuery(tabId, { text: keyword });
    for (const match of matches) {
      const key = `${match.tag}:${match.text}:${match.rect.x}:${match.rect.y}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(match);
      }
    }
  }

  return results;
}

export async function clearExtensionErrors(tabId: number, extensionId: string): Promise<{
  cleared: boolean;
  steps: string[];
}> {
  const steps: string[] = [];

  const errorsBtn = await cdpDeepQuery(tabId, {
    selector: `extensions-item[id="${extensionId}"] #errors-button`,
  });
  if (errorsBtn.length) {
    await cdpClickCandidate(tabId, errorsBtn[0]!);
    steps.push("clicked errors button");
    await sleep(300);

    const clearAll = await cdpDeepQuery(tabId, { text: "Clear all" });
    if (clearAll.length) {
      await cdpClickCandidate(tabId, clearAll[0]!);
      steps.push("clicked clear all");
      await sleep(200);
    }

    const dismiss = await cdpDeepQuery(tabId, { selector: "cr-dialog #close-button, cr-dialog .close-button" });
    if (dismiss.length) {
      await cdpClickCandidate(tabId, dismiss[0]!);
      steps.push("dismissed dialog");
    }
    return { cleared: steps.length > 1, steps };
  }

  const altErrors = await cdpDeepQuery(tabId, { text: "Errors" });
  const ours = altErrors.find((c) => c.text === "Errors" || c.text.startsWith("Errors"));
  if (ours) {
    await cdpClickCandidate(tabId, ours);
    steps.push("clicked errors via text");
    const clearAll = await cdpDeepQuery(tabId, { text: "Clear all" });
    if (clearAll.length) {
      await cdpClickCandidate(tabId, clearAll[0]!);
      steps.push("clicked clear all");
    }
    return { cleared: steps.length > 1, steps };
  }

  return { cleared: false, steps };
}

export async function reloadExtensionFromUI(tabId: number, extensionId: string): Promise<{
  clicked: boolean;
}> {
  const reloadBtn = await cdpDeepQuery(tabId, {
    selector: `extensions-item[id="${extensionId}"] #dev-reload-button`,
  });
  if (reloadBtn.length) {
    await cdpClickCandidate(tabId, reloadBtn[0]!);
    return { clicked: true };
  }

  const alt = await cdpDeepQuery(tabId, { text: "Reload" });
  const reload = alt.find((c) => c.text === "Reload");
  if (reload) {
    await cdpClickCandidate(tabId, reload);
    return { clicked: true };
  }

  return { clicked: false };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}