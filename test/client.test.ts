import { beforeEach, describe, expect, it } from "vitest";
import { MarketClient } from "../src/core/client";
import { balanceHttp500, balanceInvalidShape, balanceOk, pricesOk, userExistsHttp500, userExistsInvalidShape, userExistsOk } from "./mocks/handlers";
import { server } from "./mocks/server";

let client: MarketClient;

beforeEach(() => {
	client = new MarketClient({ userId: "demo", secret: "supersecret" });
});

/* ────────────────────────── BALANCE ────────────────────────── */

describe("MarketClient.getBalance()", () => {
	describe("successful response", () => {
		beforeEach(() => server.use(balanceOk(42)));

		it("returns the current balance", async () => {
			await expect(client.getBalance()).resolves.toEqual({ success: true, succ: true, balance: 42 });
		});
	});

	describe.each([
		["HTTP 500 error", balanceHttp500(), /HTTP 500/],
		["invalid response schema", balanceInvalidShape(), /Unexpected response/]
	])("when %s", (_, handler, expectedError) => {
		beforeEach(() => server.use(handler));

		it("throws the correct error", async () => {
			await expect(client.getBalance()).rejects.toThrow(expectedError);
		});
	});
});

/* ────────────────────────── PRICES ────────────────────────── */

describe("MarketClient.getPrices()", () => {
	const body = { product: "cs2" } as const;

	beforeEach(() =>
		server.use(
			pricesOk({
				30: { cnt: 10, eur: 7.99, rub: 720 },
				90: { cnt: 25, eur: 20.99, rub: 1900 },
				180: { cnt: 40, eur: 38.99, rub: 3600 },
				365: { cnt: 80, eur: 69.99, rub: 6500 }
			})
		)
	);

	it("returns a price map for all durations", async () => {
		const res = await client.getPrices(body);
		if (!res.success) throw new Error(`Expected success but got error: ${res.error}`);
		expect(res.prices[30].eur).toBeGreaterThan(0);
	});
});

/* ─────────────────────── IS USER EXISTS ─────────────────────── */

describe("MarketClient.isUserExists()", () => {
	const body = { username: "someUser" } as const;

	describe("when the user exists", () => {
		beforeEach(() => server.use(userExistsOk(true)));

		it("returns `{ success: true, user_exists: true }`", async () => {
			await expect(client.isUserExists(body)).resolves.toEqual({ success: true, succ: true, user_exists: true });
		});
	});

	describe("when the user does NOT exist", () => {
		beforeEach(() => server.use(userExistsOk(false)));

		it("returns `{ success: true, user_exists: false }`", async () => {
			await expect(client.isUserExists(body)).resolves.toEqual({ success: true, succ: true, user_exists: false });
		});
	});

	describe.each([
		["HTTP 500 error", userExistsHttp500(), /HTTP 500/],
		["invalid response schema", userExistsInvalidShape(), /Unexpected response/]
	])("when %s", (_, handler, expectedError) => {
		beforeEach(() => server.use(handler));

		it("throws the correct error", async () => {
			await expect(client.isUserExists(body)).rejects.toThrow(expectedError);
		});
	});
});
