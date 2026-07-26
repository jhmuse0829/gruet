import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/gruet" : "",
  assetPrefix: isGitHubPages ? "/gruet/" : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
