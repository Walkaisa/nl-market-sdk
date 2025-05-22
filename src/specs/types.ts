import type { z } from "zod";

import type { FlagSet } from "@/lib/FlagSet.js";
import type { baseRequest } from "@/specs/_baseRequest.js";

export type Endpoint<Req extends z.ZodTypeAny = typeof baseRequest, Res extends z.ZodTypeAny = z.ZodTypeAny> = {
	path: string;
	req: Req;
	res: Res;
	flags: FlagSet;
};

export type ReqOf<E extends Endpoint> = z.infer<E["req"]>;
export type ResOf<E extends Endpoint> = z.infer<E["res"]>;
