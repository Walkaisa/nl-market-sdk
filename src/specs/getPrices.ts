import { z } from "zod";

import { FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** Entry schema for pricing at a specific duration. */
const priceEntry = z.object({
	/** Number of items included */
	cnt: z.number().int(),
	/** Price in euros */
	eur: z.number(),
	/** Price in rubles */
	rub: z.number()
});

/** Schema for pricing across supported subscription durations. */
const pricesSchema = z.object({
	/** 30-day pricing */
	"30": priceEntry,
	/** 90-day pricing */
	"90": priceEntry,
	/** 180-day pricing */
	"180": priceEntry,
	/** 365-day pricing */
	"365": priceEntry
});

/** Schema for a successful response containing price data. */
const getPriceSuccess = successResponse.extend({
	/** Map of durations to their respective price entries */
	prices: pricesSchema
});

/** Request schema specifies which product’s prices to fetch. */
const getPricesReq = baseRequest
	.extend({
		/** Product identifier (“csgo” or “cs2”) */
		product: z.enum(["csgo", "cs2"])
	})
	.strict();

/** Response schema: success with `prices` or an error. */
const getPricesRes = z.union([getPriceSuccess, errorResponse]);

/** Specification for the get-prices endpoint. */
export const getPricesSpec = {
	path: "/get-prices",
	req: getPricesReq,
	res: getPricesRes,
	flags: new FlagSet()
} as const satisfies Endpoint;

/** Type alias for the prices map returned on success. */
export type PriceMap = z.infer<typeof pricesSchema>;
