import { z } from "zod";

export default z.union([
  z.record(
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.array(z.number()),
      z.array(z.boolean())
    ])
  ),
  z.array(z.string()),
])