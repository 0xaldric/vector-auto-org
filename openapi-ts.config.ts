import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/swagger/json",
  output: {
    path: "./src/generated",
    clean: true,
  },
  plugins: [
    {
      name: "@hey-api/typescript",
      enums: "javascript",
    },
    {
      name: "@hey-api/sdk",
    },
    {
      name: "@hey-api/client-axios",
    },
    {
      name: "@tanstack/react-query",
    },
  ],
});
