/** This represents a set of flags for an endpoint. */
export enum EndpointFlags {
	/** Indicates that the endpoint requires the `integrationId`. */
	Integration = 1 << 0
}

/** This class represents a set of flags for an endpoint. */
export class FlagSet {
	/** The numeric representation of the flags. */
	private value: number;

	/**
	 * Creates a new FlagSet instance.
	 * @param flags - Optional initial flags to set.
	 */
	public constructor(flags: EndpointFlags[] = []) {
		this.value = flags.reduce((acc, flag) => acc | flag, 0);
	}

	/**
	 * Creates a new FlagSet instance from an array of flags.
	 * @param flags - Array of EndpointFlags to initialize the FlagSet.
	 * @returns A new FlagSet instance.
	 */
	public static fromArray(flags: EndpointFlags[]): FlagSet {
		return new FlagSet(flags);
	}

	/**
	 * Creates a new FlagSet instance from a number.
	 * @param value - Number representing the flags.
	 * @returns A new FlagSet instance.
	 */
	public static fromNumber(value: number): FlagSet {
		const fs = new FlagSet();
		fs.value = value;
		return fs;
	}

	/**
	 * Checks if the FlagSet contains a specific flag.
	 * @param flag - The flag to check.
	 * @returns `true` if the flag is present, `false` otherwise.
	 */
	public has(flag: EndpointFlags): boolean {
		return (this.value & flag) === flag;
	}

	/**
	 * Adds a flag to the FlagSet.
	 * @param flag - The flag to add.
	 * @returns The updated FlagSet instance.
	 */
	public add(flag: EndpointFlags): this {
		this.value |= flag;
		return this;
	}

	/**
	 * Removes a flag from the FlagSet.
	 * @param flag - The flag to remove.
	 * @returns The updated FlagSet instance.
	 */
	public remove(flag: EndpointFlags): this {
		this.value &= ~flag;
		return this;
	}

	/**
	 * Toggles a flag in the FlagSet.
	 * @param flag - The flag to toggle.
	 * @returns The updated FlagSet instance.
	 */
	public toggle(flag: EndpointFlags): this {
		this.has(flag) ? this.remove(flag) : this.add(flag);
		return this;
	}

	/**
	 * Converts the FlagSet to an array of flags.
	 * @returns An array of EndpointFlags present in the FlagSet.
	 */
	public toArray(): EndpointFlags[] {
		return (Object.values(EndpointFlags) as EndpointFlags[]).filter((flag) => typeof flag === "number" && this.has(flag));
	}

	/**
	 * Converts the FlagSet to a number.
	 * @returns The numeric representation of the flags.
	 */
	public toNumber(): number {
		return this.value;
	}

	/**
	 * Converts the FlagSet to a JSON representation.
	 * @returns An array of flag names as strings.
	 */
	public toJSON(): string[] {
		return this.toArray().map((flag) => EndpointFlags[flag]);
	}

	/**
	 * Checks if the FlagSet is empty (no flags set).
	 * @returns `true` if the FlagSet is empty, `false` otherwise.
	 */
	public isEmpty(): boolean {
		return this.value === 0;
	}

	/**
	 * Clears all flags from the FlagSet.
	 * @returns The updated FlagSet instance.
	 */
	public clear(): this {
		this.value = 0;
		return this;
	}
}
