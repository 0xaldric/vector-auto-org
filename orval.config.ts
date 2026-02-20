import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./swagger.json",
    output: {
      target: "./src/generated/api.ts",
      schemas: "./src/generated/models",
      client: "react-query",
      httpClient: "axios",
      override: {
        mutator: {
          path: "./src/lib/api-client.ts",
          name: "apiClient",
        },
        query: {
          useQuery: true,
          useMutation: true,
        },
      },
    },
  },
});
