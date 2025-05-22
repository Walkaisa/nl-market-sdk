import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		coverage: {
			exclude: ["**/node_modules/**", "**/index.ts"]
		},
		globals: true,
		restoreMocks: true,
		setupFiles: "./test/setup.ts"
	},
	plugins: [tsconfigPaths()]
});
