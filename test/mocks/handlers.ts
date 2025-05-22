import { http, HttpResponse } from "msw";

import type { PriceMap } from "../../src/specs/getPrices";

const BASE_URL = "https://user-api.neverlose.cc/api/market";

// MarketClient.getBalance()
export const balanceOk = (balance = 42) => http.post(`${BASE_URL}/get-balance`, () => HttpResponse.json({ success: true, succ: true, balance }));
export const balanceHttp500 = () => http.post(`${BASE_URL}/get-balance`, () => new HttpResponse(null, { status: 500 }));
export const balanceInvalidShape = () => http.post(`${BASE_URL}/get-balance`, () => HttpResponse.json({ success: true, succ: true }));

// MarketClient.getPrices()
export const pricesOk = (map: PriceMap) => http.post(`${BASE_URL}/get-prices`, () => HttpResponse.json({ success: true, succ: true, prices: map }));

// MarketClient.isUserExists()
export const userExistsOk = (exists = true) =>
	http.post(`${BASE_URL}/is-user-exists`, () => HttpResponse.json({ success: true, succ: true, user_exists: exists }));
export const userExistsHttp500 = () => http.post(`${BASE_URL}/is-user-exists`, () => new HttpResponse(null, { status: 500 }));
export const userExistsInvalidShape = () => http.post(`${BASE_URL}/is-user-exists`, () => HttpResponse.json({ success: true }));
