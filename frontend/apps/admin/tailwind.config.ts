import type { Config } from "tailwindcss";
// @ts-ignore - untyped shared CJS preset (single token source)
import preset from "../../packages/config/tailwind.preset.cjs";

const config: Config = {
  presets: [preset as Partial<Config>],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};
export default config;
