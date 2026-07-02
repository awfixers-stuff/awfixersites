import { flag } from "@awfixersites/utils/flags/next";

/** Example feature flag — replace with app-specific flags. */
export const showTemplateBanner = flag<boolean>({
  key: "show-template-banner",
  description: "Show a banner on the template home page.",
  defaultValue: false,
  options: [
    { label: "Off", value: false },
    { label: "On", value: true },
  ],
  decide() {
    return false;
  },
});
