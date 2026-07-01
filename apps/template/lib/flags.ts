import { flag } from "@awfixersites/utils/flags/next";

export const showPortfolioHighlight = flag<boolean>({
  key: "show-portfolio-highlight",
  description: "Highlight the portfolio section on the home page.",
  defaultValue: false,
  options: [
    { label: "Off", value: false },
    { label: "On", value: true },
  ],
  decide() {
    return false;
  },
});
