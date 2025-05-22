import { z } from "zod";

import { EndpointFlags, FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Schema for a successful response indicating visibility update was accepted. */
const integrationVisibilitySuccess = successResponse;

/** Schema for a request to update integration visibility settings. */
const integrationVisibilityReq = baseRequest
	.extend({
		/** Visibility status: `true` for public, `false` for private */
		public: z.boolean()
	})
	.strict();

/** Response schema: success if visibility update accepted, or an error. */
const integrationVisibilityRes = z.union([integrationVisibilitySuccess, errorResponse]);

/** Specification for the integration-visibility endpoint. */
export const integrationVisibilitySpec = {
	path: "/integration-visibility",
	req: integrationVisibilityReq,
	res: integrationVisibilityRes,
	flags: new FlagSet([EndpointFlags.Integration])
} as const satisfies Endpoint;
