import { randomUUID } from "node:crypto";

import { MarketError } from "@/core/errors.js";
import { http } from "@/core/http.js";
import { Signer } from "@/core/signer.js";

import { EndpointFlags } from "@/lib/FlagSet.js";

import { getBalanceSpec } from "@/specs/getBalance.js";
import { getPricesSpec } from "@/specs/getPrices.js";
import { giftProductSpec } from "@/specs/giftProduct.js";
import { integrationVisibilitySpec } from "@/specs/integrationVisibility.js";
import { isUserExistsSpec } from "@/specs/isUserExists.js";
import { isUserInvitedSpec } from "@/specs/isUserInvited.js";
import { setResellerPricesSpec } from "@/specs/setResellerPrices.js";
import { transferMoneySpec } from "@/specs/transferMoney.js";
import type { Endpoint, ReqOf, ResOf } from "@/specs/types.js";

/** Configuration options for the MarketClient. */
export type ClientOptions = {
	/** User ID for API authentication with Neverlose Market. */
	userId: string;

	/** Secret key used for request signing - keep this secure. */
	secret: string;

	/** Integration ID of your reseller account. */
	integrationId?: number;

	/** Optional API base URL (defaults to Neverlose Market API endpoint). */
	baseURL?: string;

	/** Optional function to generate unique request IDs (defaults to UUID). */
	requestIdGenerator?: () => string | number;
};

/** Client for interacting with the Neverlose Market API. */
export class MarketClient {
	/** Base URL for API requests. */
	private readonly baseURL: string;

	/** Signer instance for request authentication. */
	private readonly signer: Signer;

	/** Function to generate unique request IDs. */
	private readonly generateRequestId: () => string | number;

	/**
	 * Creates a new MarketClient instance.
	 * @param options - Configuration for API access including credentials
	 */
	public constructor(private readonly options: ClientOptions) {
		this.baseURL = options.baseURL ?? "https://user-api.neverlose.cc/api/market";
		this.signer = new Signer(options.secret);

		this.generateRequestId = options.requestIdGenerator ?? randomUUID;
	}

	/** Transfers money to another Neverlose Market user. */
	public transferMoney(body: ReqOf<typeof transferMoneySpec>): Promise<ResOf<typeof transferMoneySpec>> {
		return this.call(transferMoneySpec, body);
	}

	/** Gifts a product to another Neverlose Market user. */
	public giftProduct(body: ReqOf<typeof giftProductSpec>): Promise<ResOf<typeof giftProductSpec>> {
		return this.call(giftProductSpec, body);
	}

	/** Retrieves the current balance of the authenticated user. */
	public getBalance(body?: ReqOf<typeof getBalanceSpec>): Promise<ResOf<typeof getBalanceSpec>> {
		return this.call(getBalanceSpec, body);
	}

	/** Retrieves current prices for specified products. */
	public getPrices(body: ReqOf<typeof getPricesSpec>): Promise<ResOf<typeof getPricesSpec>> {
		return this.call(getPricesSpec, body);
	}

	/** Checks if a user exists in the Neverlose Market system. */
	public isUserExists(body: ReqOf<typeof isUserExistsSpec>): Promise<ResOf<typeof isUserExistsSpec>> {
		return this.call(isUserExistsSpec, body);
	}

	/** Checks if a user was invited to the product. */
	public isUserInvited(body: ReqOf<typeof isUserInvitedSpec>): Promise<ResOf<typeof isUserInvitedSpec>> {
		return this.call(isUserInvitedSpec, body);
	}

	/** Configure whether your reseller integration should be public or private. */
	public integrationVisibility(body: ReqOf<typeof integrationVisibilitySpec>): Promise<ResOf<typeof integrationVisibilitySpec>> {
		return this.call(integrationVisibilitySpec, body);
	}

	/** Configure your reseller prices to display them on Neverlose. */
	public setResellerPrices(body: ReqOf<typeof setResellerPricesSpec>): Promise<ResOf<typeof setResellerPricesSpec>> {
		return this.call(setResellerPricesSpec, body);
	}

	/** Core method that handles API calls with request signing, validation, and error handling. */
	private async call<E extends Endpoint>(spec: E, argBody?: ReqOf<E>): Promise<ResOf<E>> {
		let body: ReqOf<E>;

		try {
			body = spec.req.parse(argBody ?? {}) as ReqOf<E>;
		} catch (err) {
			throw new MarketError("VALIDATION", `Invalid request payload for ${spec.path}`, { cause: err });
		}

		const requestId = body.requestId ?? this.generateRequestId();

		body = {
			id: requestId,
			user_id: this.options.userId,
			...body
		} as const;

		const hasIntegrationFlag = spec.flags.has(EndpointFlags.Integration);
		if (hasIntegrationFlag) {
			if (!this.options.integrationId) {
				throw new MarketError("CONFIGURATION", "Missing `integrationId` for reseller specification.");
			}

			body = {
				...body,
				integration_id: this.options.integrationId
			} as const;
		}

		const signature = this.signer.make(body);
		const url = `${this.baseURL}${spec.path}`;

		let rawResponse: unknown;

		try {
			rawResponse = await http<unknown>(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...body, signature })
			});
		} catch (err) {
			throw err instanceof MarketError ? err : new MarketError("NETWORK", `Failed to send request to ${spec.path}`, { cause: err });
		}

		try {
			return spec.res.parse(rawResponse) as ResOf<E>;
		} catch (err) {
			throw new MarketError("VALIDATION", `Unexpected response format for ${spec.path}`, { cause: err });
		}
	}
}
