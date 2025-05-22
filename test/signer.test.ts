import { describe, expect, it } from "vitest";

import { Signer } from "../src/core/signer";

describe("Signer", () => {
	const signer = new Signer("secret");

	describe("make()", () => {
		it("should generate a valid 64-character SHA256 hash", () => {
			const signature = signer.make({ foo: 1, bar: "x" });

			expect(signature).toMatch(/^[a-f0-9]{64}$/);
			expect(typeof signature).toBe("string");
			expect(signature.length).toBe(64);
		});

		it("should produce the same hash for objects with the same keys in different order", () => {
			const sig1 = signer.make({ a: 1, z: 2 });
			const sig2 = signer.make({ z: 2, a: 1 });

			expect(sig1).toBe(sig2);
		});

		it("should produce different hashes for different content", () => {
			const sig1 = signer.make({ foo: 1, bar: "x" });
			const sig2 = signer.make({ foo: 2, bar: "x" });

			expect(sig1).not.toBe(sig2);
		});
	});
});
