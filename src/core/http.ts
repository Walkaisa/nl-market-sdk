import { MarketError } from "@/core/errors.js";

/** Extended fetch options with timeout and retry settings. */
export interface HttpOptions extends RequestInit {
	/**
	 * Maximum time in milliseconds before aborting the request.
	 * @default 10000
	 */
	timeout?: number;
	/**
	 * Number of retry attempts for network or timeout failures.
	 * @default 1
	 */
	retries?: number;
}

/** Performs an HTTP request with built-in timeout, retry logic, and JSON/text handling. */
export async function http<T = unknown>(url: string, { timeout = 10_000, retries = 1, ...init }: HttpOptions = {}): Promise<T> {
	for (let attempt = 0; attempt <= retries; attempt++) {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), timeout);

		try {
			const res = await fetch(url, { ...init, signal: ctrl.signal });
			clearTimeout(timer);

			if (!res.ok) {
				throw new MarketError("HTTP", `HTTP ${res.status} on ${url}`);
			}

			const ct = res.headers.get("content-type") ?? "";
			const out = ct.includes("json") ? await res.json() : await res.text();
			return out as T;
		} catch (err) {
			clearTimeout(timer);

			const isAbort = err instanceof DOMException && err.name === "AbortError";
			if (isAbort && attempt < retries) continue;

			if (err instanceof MarketError) {
				if (err.code === "HTTP" || attempt === retries) throw err;
				continue;
			}

			if (attempt === retries) {
				throw new MarketError("NETWORK", `Network error on ${url}`, { cause: err });
			}
		}
	}

	throw new MarketError("NETWORK", `Retries exhausted for ${url}`);
}
