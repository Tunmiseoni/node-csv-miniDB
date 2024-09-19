import { z } from "zod";


export const Name = z.string();

// export const Data = z.union([
//   z.record(
//     z.union([
//       z.string(),
//       z.number(),
//       z.boolean(),
//       z.array(z.string()),
//       z.array(z.number()),
//       z.array(z.boolean()),
//     ])
//   ),
//   z.array(z.string()),
// ]);