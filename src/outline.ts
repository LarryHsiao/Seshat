import type { Config } from "./config.js";

export class OutlineError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "OutlineError";
  }
}

export class OutlineClient {
  constructor(private readonly config: Config) {}

  async call<T = unknown>(
    endpoint: string,
    payload: Record<string, unknown> = {},
  ): Promise<T> {
    const url = `${this.config.baseUrl}/api/${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let body: unknown;
    try {
      body = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    if (!res.ok) {
      throw new OutlineError(
        `Outline ${endpoint} failed: ${res.status} ${res.statusText}`,
        res.status,
        body,
      );
    }

    return body as T;
  }
}
