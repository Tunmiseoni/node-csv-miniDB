// const fs = require("fs");
// import { z } from "zod";

// import Error from "../utils/models/error";
// import schema from "../utils/models/read";

// function read(name: string, data: z.infer<typeof schema>): any {
//   try {
//     const schemaValidation = schema.safeParse(data);
//     if (!schemaValidation.success) throw new Error(`${schemaValidation.error}`);

//     if (!name.includes(".csv")) name += ".csv";

//     fs.stat(`./store/${name}`, (err: Error) => {
//       if (!err) {
//         console.error(
//           `The file or directory at './store/${name}' already exists.`
//         );
//         return;
//       }

//       if (err && err.code !== "ENOENT") {
//         console.error(`Error accessing file './store/${name}':`, err);
//         return;
//       }
//   } catch (err) {
//     console.error(err);
//   }
// }

// module.exports = { read };
