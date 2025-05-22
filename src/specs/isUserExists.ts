import { z } from "zod";

import { FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Schema for a successful user existence check response. */
const isUserExistsSuccess = successResponse.extend({
	/** Whether the specified user exists */
	user_exists: z.boolean()
});

/** Request schema for checking if a user exists. */
const isUserExistsReq = baseRequest
	.extend({
		/** Username to check (minimum 3 characters) */
		username: z.string().min(3)
	})
	.strict();

/** Response schema: success with `user_exists` or an error. */
const isUserExistsRes = z.union([isUserExistsSuccess, errorResponse]);

/** Specification for the is-user-exists endpoint. */
export const isUserExistsSpec = {
	path: "/is-user-exists",
	req: isUserExistsReq,
	res: isUserExistsRes,
	flags: new FlagSet()
} as const satisfies Endpoint;
