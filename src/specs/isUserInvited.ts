import { z } from "zod";

import { FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Schema for a successful invitation check response. */
const isUserInvitedSuccess = successResponse.extend({
	/** Whether the cheat is publicly available */
	cheat_public: z.boolean(),
	/** Whether the specified user has been invited */
	user_invited: z.boolean()
});

/** Request schema for checking if a user is invited to a product. */
const isUserInvitedReq = baseRequest
	.extend({
		/** Username to check (minimum 3 characters) */
		username: z.string().min(3),
		/** Product identifier (“csgo” or “cs2”) */
		product: z.enum(["csgo", "cs2"])
	})
	.strict();

/** Response schema: success with invitation flags or an error. */
const isUserInvitedRes = z.union([isUserInvitedSuccess, errorResponse]);

/** Specification for the is-user-invited endpoint. */
export const isUserInvitedSpec = {
	path: "/is-user-invited",
	req: isUserInvitedReq,
	res: isUserInvitedRes,
	flags: new FlagSet()
} as const satisfies Endpoint;
