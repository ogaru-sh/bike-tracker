import { defineConfig } from "orval";

export default defineConfig({
  bikeTracker: {
    // ─── 入力: OpenAPI spec ───
    input: {
      target: "../openapi.json",
    },

    // ─── 出力: TanStack Query hooks + 型 ───
    output: {
      target: "./src/generated/endpoints",
      schemas: "./src/generated/models",
      client: "react-query",
      mode: "tags-split",
      prettier: true,

      override: {
        query: {
          useQuery: true,
          useMutation: true,
          version: 5,
          signal: true,
        },
        mutator: {
          path: "../lib/api-client.ts",
          name: "apiClient",
        },
      },
    },
  },
});
