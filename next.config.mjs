import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("./scripts/load-external-env.cjs").loadExternalEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
