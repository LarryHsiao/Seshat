import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Config {
  baseUrl: string;
  apiToken: string;
}

const CONFIG_LOCATIONS = [
  process.env.SESHAT_CONFIG,
  join(process.cwd(), "config.json"),
  join(homedir(), ".config", "seshat", "config.json"),
].filter((p): p is string => typeof p === "string" && p.length > 0);

function loadBaseUrlFromFile(): string | undefined {
  for (const path of CONFIG_LOCATIONS) {
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = JSON.parse(raw);
      if (typeof parsed.baseUrl === "string" && parsed.baseUrl.length > 0) {
        return parsed.baseUrl.replace(/\/+$/, "");
      }
    } catch {
      // File not present or unreadable — try next location.
    }
  }
  return undefined;
}

export function loadConfig(): Config {
  const envBase = process.env.OUTLINE_BASE_URL?.replace(/\/+$/, "");
  const baseUrl = envBase || loadBaseUrlFromFile();
  const apiToken = process.env.OUTLINE_API_TOKEN;

  if (!baseUrl) {
    throw new Error(
      "Missing Outline base URL. Set OUTLINE_BASE_URL or add `baseUrl` to config.json.",
    );
  }
  if (!apiToken) {
    throw new Error("Missing OUTLINE_API_TOKEN environment variable.");
  }

  return { baseUrl, apiToken };
}
