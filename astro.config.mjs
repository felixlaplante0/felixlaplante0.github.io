import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

const font = (name, cssVariable, options) => ({ provider: fontProviders.fontsource(), name, cssVariable, ...options });

export default defineConfig({
  site: "https://felixlaplante.com",
  integrations: [mdx(), icon()],
  fonts: [
    font("Source Sans 3", "--font-body", { weights: [400, 600], styles: ["normal", "italic"], fallbacks: ["system-ui", "sans-serif"] }),
    font("DM Sans", "--font-heading", { weights: [700], styles: ["normal"], fallbacks: ["system-ui", "sans-serif"] }),
    font("EB Garamond", "--font-serif", { styles: ["normal", "italic"], fallbacks: ["Georgia", "serif"] }),
  ],
});
