import { z } from "zod";

export function validate<T>(data: T, Data: z.ZodTypeAny): T {
  const result = Data.safeParse(data);
  if (!result.success) throw new Error(result.error.message);
  return result.data
}