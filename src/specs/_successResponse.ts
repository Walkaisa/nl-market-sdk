import { z } from "zod";

/** Standard success response structure from the Neverlose Market API. */
export const successResponse = z
	.object({
		/** Indicates the operation succeeded */
		success: z.literal(true),
		/** Indicates the operation succeeded */
		succ: z.literal(true)
	})
	.strict();
