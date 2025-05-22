import { z } from "zod";

/** Base schema for all request payloads, with optional trace ID. */
export const baseRequest = z
	.object({
		/** Optional trace ID (`string`|`number`), `1–80 chars`, `A–Z`, `a–z`, `0–9`, `.-_` */
		requestId: z
			.union([z.string(), z.number()])
			.optional()
			.refine((val) => val === undefined || /^[A-Za-z0-9._-]{1,80}$/.test(String(val)), {
				message: "requestId must be 1–80 chars: A–Z, a–z, 0–9, '.', '-' or '_'"
			})
	})
	.strict();
