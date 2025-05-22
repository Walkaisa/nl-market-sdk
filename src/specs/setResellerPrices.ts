import { z } from "zod";

import { EndpointFlags, FlagSet } from "@/lib/FlagSet.js";

import { baseRequest } from "@/specs/_baseRequest.js";
import { errorResponse } from "@/specs/_errorResponse.js";
import { successResponse } from "@/specs/_successResponse.js";
import type { Endpoint } from "@/specs/types.js";

/** This represents a price value, which can be either a single decimal string. */
const PriceValue = z.union([
	z.string().regex(/^[0-9]+\.[0-9]+$/, {
		message: "Must be a decimal string, e.g. '14.10'"
	}),
	z
		.tuple([
			z.string().regex(/^[0-9]+\.[0-9]+$/, {
				message: "First element of range must be decimal string"
			}),
			z.string().regex(/^[0-9]+\.[0-9]+$/, {
				message: "Second element of range must be decimal string"
			})
		])
		.refine(([a, b]) => Number.parseFloat(a) < Number.parseFloat(b), {
			message: "Range must be in ascending order"
		})
]);

/** A map of up to 3 currency codes (e.g. "EUR", "USD", "RUB") to price values. */
const CurrencyMap = z
	.record(
		z
			.string()
			.length(3)
			.regex(/^[A-Z]{3}$/, {
				message: "Currency code must be exactly 3 uppercase letters"
			}),
		PriceValue
	)
	.refine((map) => Object.keys(map).length <= 3, {
		message: "At most three currencies per product"
	});

/** Pricing structure across multiple products and durations. */
const PricesObject = z
	.object({
		"cs2-30": CurrencyMap.optional(),
		"cs2-90": CurrencyMap.optional(),
		"cs2-180": CurrencyMap.optional(),
		"cs2-365": CurrencyMap.optional(),
		"csgo-30": CurrencyMap.optional(),
		"csgo-90": CurrencyMap.optional(),
		"csgo-180": CurrencyMap.optional(),
		"csgo-365": CurrencyMap.optional(),
		marketplace: CurrencyMap.optional()
	})
	.strict();

/** Request schema containing pricing data for one or more products. */
const setResellerPricesReq = baseRequest
	.extend({
		prices: PricesObject
	})
	.strict();

/** Response schema: success or error depending on processing outcome. */
const setResellerPricesRes = z.union([successResponse, errorResponse]);

export const setResellerPricesSpec = {
	path: "/set-reseller-prices",
	req: setResellerPricesReq,
	res: setResellerPricesRes,
	flags: new FlagSet([EndpointFlags.Integration])
} as const satisfies Endpoint;
