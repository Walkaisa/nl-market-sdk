import { z } from "zod";

import { FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Schema for a successful balance response. */
const getBalanceSuccess = successResponse.extend({
	/** Current account balance in NLE units */
	balance: z.number()
});

/** Request schema for retrieving the user’s balance. */
const getBalanceReq = baseRequest;

/** Response schema: success with `balance` or an error. */
const getBalanceRes = z.union([getBalanceSuccess, errorResponse]);

/** Specification for the get-balance endpoint. */
export const getBalanceSpec = {
	path: "/get-balance",
	req: getBalanceReq,
	res: getBalanceRes,
	flags: new FlagSet()
} as const satisfies Endpoint;
