import type { Appearance } from "@stripe/stripe-js";

export function stripeAppearance(isDark: boolean): Appearance {
  return {
    theme: isDark ? "night" : "stripe",
    variables: {
      colorPrimary: isDark ? "#f8f8f8" : "#1a1a1a",
      colorBackground: isDark ? "#141414" : "#ffffff",
      colorText: isDark ? "#f0f0ec" : "#1a1a1a",
      colorDanger: "#ef4444",
      fontFamily: "var(--font-sans), system-ui, sans-serif",
      fontSizeBase: "15px",
      spacingUnit: "4px",
      borderRadius: "12px",
      focusBoxShadow: isDark
        ? "0 0 0 3px rgba(248, 248, 248, 0.12)"
        : "0 0 0 3px rgba(26, 26, 26, 0.08)",
    },
    rules: {
      ".Input": {
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.1)",
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
        boxShadow: "none",
        padding: "12px 14px",
      },
      ".Input:focus": {
        border: isDark ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(0,0,0,0.22)",
      },
      ".Label": {
        fontWeight: "500",
        marginBottom: "6px",
      },
      ".Tab": {
        borderRadius: "10px",
      },
      ".Tab--selected": {
        border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.14)",
      },
    },
  };
}