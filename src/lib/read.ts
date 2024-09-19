import fs from "fs";
import path from "path";
import { z } from "zod";
import Error from "../utils/models/error";
import { validate } from "../utils/validator";
import { deformat } from "../utils/formatter";
import { Name } from "../utils/models/read";

export function readTable(name: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      validate(name, Name);

      let filePath = path.posix.join("./store", name);
      if (!filePath.endsWith(".csv")) filePath += ".csv";

      if (!fs.existsSync(filePath)) {
        return reject(new Error(`The file '${filePath}' does not exist.`));
      }

      const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

      resolve([fileContent]);

    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
