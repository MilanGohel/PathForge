import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mermaid pulls optional diagram deps (d3-sankey, cytoscape, …). Keep them
  // out of the server graph; client loads mermaid only via dynamic import.
  serverExternalPackages: ["mermaid", "d3-sankey"],
  // pnpm nests mermaid's deps; hoist aliases so Turbopack can resolve them.
  turbopack: {
    resolveAlias: {
      "d3-sankey": "d3-sankey",
    },
  },
};

export default nextConfig;
