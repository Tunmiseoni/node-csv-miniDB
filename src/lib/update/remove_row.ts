import fs from "fs";
import path from "path";

import { z } from "zod";

import { validate } from "../../utils/validator";
import { format, deformat } from "../../utils/formatter";

export function removeRow(data: {
  name: string;
  query: (row: any) => boolean;
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, query } = data;

      validate(name, z.string());
      validate(query, z.function().args(z.any()).returns(z.boolean()));

      name = path.posix.join("./store", name);
      if (!name.endsWith(".csv")) name += ".csv";

      const tempFilePath = path.posix.join("./store", `temp_${Date.now()}.csv`);

      fs.stat(name, (err, stats) => {
        if (err)
          return reject(new Error(`Error checking file stats: ${err.message}`));

        if (stats.size === 0)
          return reject(new Error(`The file '${name}' is empty.`));

        const readStream = fs.createReadStream(name);
        const writeStream = fs.createWriteStream(tempFilePath);

        readStream.on("error", (err) => {
          reject(new Error(`Error reading the source file: ${err.message}`));
        });

        writeStream.on("error", (err) => {
          reject(
            new Error(`Error writing to destination file: ${err.message}`)
          );
        });

        const rl = require("readline").createInterface({
          input: readStream,
          crlfDelay: Infinity,
        });

        rl.on("error", (err: NodeJS.ErrnoException) => {
          reject(new Error(`Error reading columns: ${err.message}`));
        });

        let lineCount = 0;
        let columns: string[] = [];

        rl.on("line", (line: string) => {
            if (lineCount == 0) {
                columns = deformat(line);
            }
            // TODO:Cant perform operations with query if the line is all text, after deformating line, I need to get the types of the values in deformat(line)
            // Perhaps storing types of columns in a separate file is the play?
            // Check last convo with gpt
            
        });

        rl.on("close", () => {
          rl.removeAllListeners();

          fs.rename(tempFilePath, name, (err) => {
            if (err) {
              return reject(
                new Error(`Error replacing original file: ${err.message}`)
              );
            }
            resolve(`Rows added to '${name} successfully'`);
          });
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
