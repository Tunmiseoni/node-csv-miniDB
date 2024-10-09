import { z } from "zod";

export default {
  validationMap: {
    string: z.string(),
    number: z.number(),
    boolean: z.boolean(),
    date: z.date(),
    object: z.object({}),
  },
  enum: z.enum(["string", "number", "boolean", "date", "object"], {
    errorMap: () => ({
      message: "Type must be either string, number, boolean, date or object",
    }),
  })
};
