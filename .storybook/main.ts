import path from "path";
import type { StorybookConfig } from "@storybook/react-vite";

process.env.STORYBOOK = "true";

const config: StorybookConfig = {
  stories: ["../app/**/*.mdx", "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/react-vite",
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldExtractValuesFromUnion: true,
      propFilter: (prop: { parent?: { fileName: string } }) =>
        prop.parent ? !prop.parent.fileName.includes("node_modules") : true,
    },
  },
  viteFinal(config) {
    config.plugins = [
      ...(config.plugins ?? []),
      {
        name: "resolve-file-urls",
        resolveId(id: string) {
          if (id.startsWith("file://")) return id.replace("file://", "");
        },
      },
    ];
    return config;
  },
};
export default config;
