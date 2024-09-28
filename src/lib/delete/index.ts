import fs from "fs";
import path from "path";

import { z } from "zod";

import { validate } from "../../utils/validator";
import { Table } from "../../utils/models/delete";

export function deleteTable(name: z.infer<typeof Table>): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      validate(name, Table);

      name = path.posix.join("./store", name);
      if (!name.endsWith(".csv")) name += ".csv";

      fs.unlink(name, (err) => {
        if (err) {
          if (err.code === "ENOENT")
            return reject(
              new Error(`The file or directory at '${name}' does not exist.`)
            );
          return reject(
            new Error(`Error deleting file '${name}': ${err.message}`)
          );
        }
        resolve(`Table '${name}' deleted successfully`);
      });
    } catch (err) {
      reject(err);
    }
  });
}