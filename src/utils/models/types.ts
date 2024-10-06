import { z } from "zod";

export default z.enum(["string", "number", "boolean", "date", "object"], {
  errorMap: () => ({
    message: "Type must be either string, number, boolean, date or object",
  }),
});
