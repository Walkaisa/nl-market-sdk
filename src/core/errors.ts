/** Enumeration of possible error codes for MarketError. */
export type ErrorCode =
	/** Network-level failure (e.g., DNS lookup, connection) */
	| "NETWORK"
	/** Request timeout exceeded */
	| "TIMEOUT"
	/** Non-2xx HTTP status returned */
	| "HTTP"
	/** API-specific error response */
	| "API"
	/** Validation of input data failed */
	| "VALIDATION"
	/** Referenced resource ID was invalid */
	| "INVALID_ID"
	/** Missing necessary information. */
	| "CONFIGURATION";

/** Custom error class for market operations, extending the built-in Error. */
export class MarketError<C extends ErrorCode = ErrorCode> extends Error {
	/** The error’s code identifying its category. */
	public readonly code: C;

	/** Standardized name for all MarketError instances. */
	public readonly name: string = "MarketError";

	/**
	 * Creates a new MarketError instance.
	 *
	 * @param code - One of the predefined error codes.
	 * @param message - Human-readable error message.
	 * @param options?.cause - Optional underlying error or cause.
	 */
	public constructor(code: C, message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.code = code;
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
