import { z } from "zod";


export const Name = z.union([
  z.string(),
  z.array(z.string())
])