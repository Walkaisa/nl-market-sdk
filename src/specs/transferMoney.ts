import { z } from "zod";

import { FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Schema for a successful money transfer response. */
const transferMoneySuccess = successResponse;

/** Request schema for transferring money to another user. */
const transferMoneyReq = baseRequest
	.extend({
		/** Recipient’s username (minimum 3 characters) */
		username: z.string().min(3),
		/** Amount to transfer (positive integer) */
		amount: z.number().int().positive()
	})
	.strict();

/** Response schema: success or error. */
const transferMoneyRes = z.union([transferMoneySuccess, errorResponse]);

/** Specification for the transfer-money endpoint. */
export const transferMoneySpec = {
	path: "/transfer-money",
	req: transferMoneyReq,
	res: transferMoneyRes,
	flags: new FlagSet()
} as const satisfies Endpoint;
