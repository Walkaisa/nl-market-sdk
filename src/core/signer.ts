import { createHash, timingSafeEqual } from "node:crypto";

/** Generates and validates SHA-256 signatures for request bodies. */
export class Signer {
	/** Secret key used to sign and verify the signature */
	private readonly secret: string;

	/**
	 * Creates a new Signer instance.
	 * @param secret Secret appended to payload before hashing.
	 */
	public constructor(secret: string) {
		this.secret = secret;
	}

	/**
	 * Creates a hex-encoded SHA-256 signature of the given request body.
	 * @param body Object whose sorted key/value concatenation will be hashed.
	 * @returns Hex-encoded SHA-256 digest.
	 */
	public make<T extends Record<string, unknown>>(body: T): string {
		const concat = Object.keys(body)
			.sort()
			.map((k) => `${k}${String(body[k])}`)
			.join("");

		return createHash("sha256")
			.update(concat + this.secret)
			.digest("hex");
	}

	/**
	 * Validates that the `signature` field on the object matches the signature computed over the rest of the fields.
	 *
	 * @param payload Object including a `signature` field and other data.
	 * @returns `true` if signatures match, `false` otherwise.
	 */
	public validate<T extends Record<string, unknown> & { signature: string }>(payload: T): boolean {
		const { signature, ...dataWithoutSignature } = payload;

		const expected = this.make(dataWithoutSignature as Record<string, unknown>);

		const sigBuf = Buffer.from(signature, "hex");
		const expBuf = Buffer.from(expected, "hex");

		if (sigBuf.length !== expBuf.length) return false;

		return timingSafeEqual(sigBuf, expBuf);
	}
}
