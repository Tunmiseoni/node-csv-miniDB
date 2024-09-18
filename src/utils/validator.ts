import { z } from "zod";

export function validate(data: any, Data: z.ZodTypeAny) {
  const result = Data.safeParse(data);
  if (!result.success) throw new Error(result.error.message);
}