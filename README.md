<div align="center">
    <br />
    <p>
        <a href="https://neverlose.cc">
            <img src="https://neverlose.cc/static/assets/img/logo.png" width="546" alt="neverlose.cc" />
        </a>
    </p>
    <br />
    <p>
        <a href="https://github.com/Walkaisa/nl-market-sdk/actions/workflows/ci.yml">
            <img src="https://github.com/Walkaisa/nl-market-sdk/actions/workflows/ci.yml/badge.svg?maxAge=3600" alt="CI">
        </a>
        <a href="https://www.npmjs.com/package/nl-market-sdk">
            <img src="https://img.shields.io/npm/v/nl-market-sdk" alt="NPM Version">
        </a>
        <a href="https://github.com/Walkaisa/nl-market-sdk">
            <img src="https://img.shields.io/npm/dt/nl-market-sdk" alt="NPM Downloads">
        </a>
        <a href="https://github.com/Walkaisa/nl-market-sdk/commits/main">
            <img src="https://img.shields.io/github/last-commit/Walkaisa/nl-market-sdk.svg?logo=github&logoColor=ffffff" alt="Latest Commit">
        </a>
        <a href="https://github.com/Walkaisa/nl-market-sdk/releases/latest">
            <img src="https://img.shields.io/github/v/release/Walkaisa/nl-market-sdk?logo=github&logoColor=ffffff" alt="Latest Release">
        </a>
        <a href="https://github.com/Walkaisa/nl-market-sdk/LICENSE">
            <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
        </a>
        <a href="https://walkaisa.dev/discord">
            <img src="https://img.shields.io/discord/996889527698341978?label=discord&logoColor=ffffff" alt="Discord">
        </a>
    </p>
</div>

# nl-market-sdk

🚀 **Typed SDK for the Neverlose Marketplace API**

`nl-market-sdk` is a fully‑typed Node.js/TypeScript client for the [Neverlose.cc marketplace API](https://github.com/neverlosecc/marketplace-api).
It wraps the HTTP endpoints in a friendly, type‑safe interface with automatic request‑ID generation and transparent cryptographic signing – so you can focus on building features, not wiring JSON.

> **Minimum runtime:** Node ≥ 22.12 · **Bundled types:** yes · **ESM & CJS:** dual export

---

## Table of Contents

* [Installation](#installation)
* [Quick-Start](#quickstart)
* [Why this SDK?](#whythissdk)
* [Result Shape ⇄ Union Explained](#resultshapeunionexplained)
* [API Cheat Sheet](#api-cheatsheet)
* [Endpoint Cookbook](#endpoint-cookbook)
* [Understanding CNT](#understandingcnt)
* [Error Handling](#error-handling)
* [Type Safety](#type-safety)
* [Reseller Toolkit](#resellertoolkit)
* [Development](#development)
* [License](#license)

---

## Installation

```bash
# npm
npm install nl-market-sdk

# pnpm (recommended)
pnpm add nl-market-sdk
```

*…or yarn / bun – pick your poison.*

---

## Quick‑Start

```ts
import { MarketClient } from "nl-market-sdk";

const client = new MarketClient({
  userId: "12345",              // Neverlose → API settings
  secret: "SUPER_SECRET_KEY",   // keep me secret!
  // integrationId: 100         // ONLY if you use checkout integration
});

const res = await client.getBalance();
if (res.success) console.log(`💰 ${res.balance}\u00A0NLE left`);
```

You just:

1. Auto‑generated a unique request‑ID 🔑
2. Signed the payload with SHA‑256 🕵️‍♂️
3. Runtime‑validated the response ✅

No manual `fetch`, no crypto copy‑pasta.

---

## Why this SDK?

* **Tiny API.** One class, typed methods – that’s it.
* **End‑to‑end types.** Your IDE autocompletes the exact response shape *and* yells on wrong params.
* **Runtime guardrails.** Unexpected data? Instant `MarketError('VALIDATION', …)` – not silent breakage.
* **Cryptography handled.** SHA‑256 signatures & constant‑time compare baked‑in.

Grab a coffee ☕️ while everyone else hand‑rolls signatures.

---

## Result Shape ⇄ Union Explained

Every SDK call resolves to **one of two objects**:

```ts
// success branch (data lives here)
{ success: true, ...payload }

// error branch (soft API error, 4xx‑style)
{ success: false, error: string }
```

👉 **Always check `success` first** – your editor auto‑narrows the type in each branch.

Severe issues outside the normal contract (network, non‑2xx, schema drift…) throw a typed `MarketError`.

---

## API Cheat Sheet

Below is a structured overview of every helper the SDK exposes – grouped by the permissions that Neverlose enforces.

### Public Endpoints (accessible to every account)

| Method         | Purpose                            |
| -------------- | ---------------------------------- |
| `getBalance()` | Retrieve your current NLE balance. |

### Reseller Endpoints – **no `integrationId` required**

> You must be flagged as an **official reseller** but you don’t need to pass `integrationId`.

| Method                | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `getPrices(body)`     | Fetch latest subscription prices for a product.    |
| `isUserExists(body)`  | Check whether a username exists.                   |
| `isUserInvited(body)` | Check whether a user is invited to CS\:GO / CS2.   |
| `transferMoney(body)` | Send NLE credits to another user.                  |
| `giftProduct(body)`   | Gift a CS\:GO or CS2 subscription to another user. |

### Reseller Endpoints – **`integrationId` required**

> Official reseller permission **and** a valid `integrationId` (see constructor) are mandatory.

| Method                        | Purpose                                                                                                  |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `integrationVisibility(body)` | Toggle your reseller integration between **public** and **private**.                                     |
| `setResellerPrices(body)`     | Publish or refresh your reseller pricing so that it appears in the Neverlose checkout UI (expires 24 h). |

---

## Endpoint Cookbook

For in‑depth request/response examples, head over to the [Marketplace API docs](https://github.com/neverlosecc/marketplace-api). The tables above serve as your quick reference.

---

## Understanding `cnt`

`cnt` is the **plan selector** common to every product:

| `cnt` | Subscription length |
| ----: | ------------------- |
|   `0` | 30 days             |
|   `1` | 90 days             |
|   `2` | 180 days            |
|   `3` | 365 days            |

Mix `product` + `cnt` → exact upgrade.

---

## Error Handling

```ts
try {
  const tx = await client.transferMoney({ username: "alice", amount: 5 });
  if (!tx.success) {
    console.warn(tx.error);      // e.g. "Insufficient balance"
    return void 0;
  }

  console.log("Transfer accepted ✔️");
} catch (err) {
  if (err instanceof MarketError) {
    console.error(`Fatal SDK error [${err.code}]:`, err.message);
  } else {
    throw err;                  // unknown – re‑throw
  }
}
```

### Error Codes

| Code            | When it happens                                 |
| --------------- | ----------------------------------------------- |
| `NETWORK`       | DNS issues, TLS errors, connection reset…       |
| `TIMEOUT`       | (reserved)                                      |
| `HTTP`          | Non‑2xx status code from Neverlose API          |
| `API`           | `success: false` response from the API          |
| `VALIDATION`    | Payload or response fails Zod schema validation |
| `INVALID_ID`    | Duplicate or malformed `id` │ `requestId`       |
| `CONFIGURATION` | Missing `integrationId` for reseller endpoints  |

---

## Type Safety

Each endpoint is backed by a colocated **Zod** schema.
The SDK uses them twice:

1. **Compile‑time** – `z.infer` generates TypeScript types for parameters & results → auto‑completion, no `any`.
2. **Run‑time** – responses are parsed with `schema.parse()` → any shape drift throws a `MarketError("VALIDATION", …)`.

That means **no silent‑failing JSON, ever**.

---

## Reseller Toolkit

If you operate a payment gateway or top‑up service you’ll love these helpers:

| Helper                     | Description                                               |
| -------------------------- | --------------------------------------------------------- |
| `Signer.make(body)`        | Generate the SHA‑256 signature required by every request. |
| `Signer.validate(payload)` | Constant‑time comparison of an incoming webhook payload.  |
| `integrationVisibility()`  | One‑liner to toggle sandbox / production exposure.        |
| `setResellerPrices()`      | Publish dynamic pricing (auto‑expires after 24 h).        |

---

## Development

```ps1
pnpm lint      # format + static‑analysis
pnpm test      # vitest suite
pnpm build     # tsup → dist (ESM & CJS)
pnpm dev       # watch‑build demo.ts
```

Code style, tests and semantic commits are enforced by **Biome**, **Vitest** and **Semantic‑Release**.

---

## License

Released under the **MIT License** – do whatever you want, just keep the copyright and don’t blame me if things go boom. See [`LICENSE`](./LICENSE) for the full text.
