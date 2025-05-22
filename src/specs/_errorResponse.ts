import { z } from "zod";

/** Standard error response structure from the Neverlose Market API. */
export const errorResponse = z
	.object({
		/** Indicates operation failure. */
		success: z.literal(false),
		/** Indicates operation failure. */
		succ: z.literal(false),
		/** Error message describing what went wrong. */
		error: z.string()
	})
	.strict();
