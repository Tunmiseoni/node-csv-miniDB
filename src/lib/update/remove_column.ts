import fs from "fs";
import path from "path";

import { z } from "zod";

import { validate } from "../../utils/validator";
import { format, deformat } from "../../utils/formatter";

export function removeColumn(data: {
  name: string;
  column: string | string[];
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, column } = data;

      validate(name, z.string());
      validate(column, z.union([z.string(), z.array(z.string())]));
      const columns = Array.isArray(column) ? column : [column];

      name = path.posix.join("./store", name);
      if (!name.endsWith(".csv")) name += ".csv";

      const tempFilePath = path.posix.join("./store", `temp_${Date.now()}.csv`);

      fs.stat(name, (err, stats) => {
        if (err)
          return reject(new Error(`Error checking file stats: ${err.message}`));

        if (stats.size === 0)
          return reject(new Error(`The file '${name}' is empty.`));

        const fileStream = fs.createReadStream(name);
        const writeStream = fs.createWriteStream(tempFilePath);

        fileStream.on("error", (err) => {
          reject(new Error(`Error reading file: ${err.message}`));
        });

        writeStream.on("error", (err) =>
          reject(new Error(`Error writing to temp file: ${err.message}`))
        );

        const rl = require("readline").createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        rl.on("error", (err: NodeJS.ErrnoException) => {
          reject(new Error(`Error reading line: ${err.message}`));
        });

        let lineCount = 0;
        let columnIndexes: number[] = [];

        rl.on("line", (line: string) => {
          const cells = deformat(line);

          if (lineCount === 0) {
            cells.map((el, i) => {
              if(columns.includes(el)) columnIndexes.push(i);
            });

            if (columnIndexes.length == 0) {
              rl.removeAllListeners();
              fs.unlink(tempFilePath, (err) => {
                if (err) {
                  return reject(
                    new Error(`Error deleting temp file: ${err.message}`)
                  );
                }
              });
              return reject(new Error(`Columns: '${columns.join(", ")}' not found.`));
            }
          }

          writeStream.write(format(cells.filter((el, i) => !columnIndexes.includes(i))).join(",") + "\n");

          lineCount++;
        });

        rl.on("close", () => {
          writeStream.end();
          rl.removeAllListeners();

          fs.rename(tempFilePath, name, (err) => {
            if (err) {
              return reject(
                new Error(`Error replacing original file: ${err.message}`)
              );
            }
            resolve(`Columns removed successfully from '${name}'`);
          });
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}