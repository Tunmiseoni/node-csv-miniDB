import fs from "fs";
import path from "path";

import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';

import { validate } from "../../utils/validator";
import { format, deformat } from "../../utils/formatter";

export function addRow(data: {
  name: string;
  row: {} | {}[];
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, row } = data;

      validate(name, z.string());
      validate(row, z.union([z.object({}), z.array(z.object({}))]));
      const rows = Array.isArray(row) ? row : [row];

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

        let columns: string[] = [];
        let content: string[] = [];

        rl.on("line", (line: string) => {
          columns = deformat(line);
          rl.close();
        });

        rl.on("close", () => {
          rl.removeAllListeners();

          fs.createReadStream(name)
            .pipe(writeStream)
            .on("finish", () => {
              rows.map((row) => {
                let formattedRow: string[] = [];
                if(!row["id"]) row["id"] = uuidv4()
                columns.map((col, i) => (formattedRow[i] = `${row[col] || ""}`));
                content.push(format(formattedRow).join(","));
              });

              fs.createWriteStream(tempFilePath, { flags: "a" }).write(
                content.join("\n") + "\n",
                (err) => {
                  if (err) {
                    return reject(
                      new Error(`Error writing new rows: ${err.message}`)
                    );
                  }

                  fs.rename(tempFilePath, name, (err) => {
                    if (err) {
                      return reject(
                        new Error(
                          `Error replacing original file: ${err.message}`
                        )
                      );
                    }
                    resolve(`Rows added to '${name} successfully'`);
                  });
                }
              );
            });
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
