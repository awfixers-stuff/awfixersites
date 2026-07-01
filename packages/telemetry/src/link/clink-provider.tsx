"use client";

import * as React from "react";

import { CLINK_SAFE_DEFAULT, parseClinkConfigSafe, type ClinkConfig } from "../config/schema";

const ClinkContext = React.createContext<ClinkConfig>(CLINK_SAFE_DEFAULT);

function ClinkProvider({ config, children }: { config: unknown; children: React.ReactNode }) {
  const resolved = React.useMemo<ClinkConfig>(() => {
    const { config: parsed, error } = parseClinkConfigSafe(config);
    if (error) {
      if (process.env.NODE_ENV !== "production") {
        throw new Error(`[telemetry] invalid clink.json: ${error.message}`);
      }
      console.error("[telemetry] invalid clink.json, falling back to safe defaults", error);
    }
    return parsed;
  }, [config]);

  return <ClinkContext.Provider value={resolved}>{children}</ClinkContext.Provider>;
}

function useClinkConfig(): ClinkConfig {
  return React.useContext(ClinkContext);
}

export { ClinkProvider, useClinkConfig };
