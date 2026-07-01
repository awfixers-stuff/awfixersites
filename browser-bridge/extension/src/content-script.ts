const logs: Array<{ level: string; message: string; timestamp: number }> = [];

for (const level of ["log", "info", "warn", "error", "debug"] as const) {
  const original = console[level].bind(console);
  console[level] = (...args: unknown[]) => {
    logs.push({
      level,
      message: args.map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg))).join(" "),
      timestamp: Date.now(),
    });
    if (logs.length > 200) logs.shift();
    original(...args);
  };
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "getConsoleLogs") {
    sendResponse({ logs: [...logs] });
    return true;
  }
  return false;
});