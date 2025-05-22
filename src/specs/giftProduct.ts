import { z } from "zod";

import { FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Schema for a successful gift operation response. */
const giftProductSuccess = successResponse;

/** Request schema for gifting a product. */
const giftProductReq = baseRequest
	.extend({
		/** Recipient’s username (minimum 3 characters) */
		username: z.string().min(3),
		/** Product identifier (“csgo” or “cs2”) */
		product: z.enum(["csgo", "cs2"]),
		/** Number of items to gift (0–3) */
		cnt: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)])
	})
	.strict();

/** Response schema: either success or an error. */
const giftProductRes = z.union([giftProductSuccess, errorResponse]);

/** Specification for the gift-product endpoint. */
export const giftProductSpec = {
	path: "/gift-product",
	req: giftProductReq,
	res: giftProductRes,
	flags: new FlagSet()
} as const satisfies Endpoint;
