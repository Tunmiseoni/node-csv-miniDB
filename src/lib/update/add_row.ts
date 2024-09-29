import fs from "fs";
import path from "path";

import { z } from "zod";

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

      fs.stat(name, (err, stats) => {
        if (err)
          return reject(new Error(`Error checking file stats: ${err.message}`));

        if (stats.size === 0)
          return reject(new Error(`The file '${name}' is empty.`));

        const readStream = fs.createReadStream(name);
        const writeStream = fs.createWriteStream(name, { flags: "a" });

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
          rows.map((row) => {
            let formattedRow: string[] = [];
            columns.map((col, i) => (formattedRow[i] = `${row[col]}`));
            content.push(format(formattedRow).join(","));
          });
          
          writeStream.write(content.join("\n") + "\n");
          writeStream.end();
          
          rl.removeAllListeners();
          });

        writeStream.on("finish", () => {
          resolve(`Rows added to '${name} successfully'`);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
