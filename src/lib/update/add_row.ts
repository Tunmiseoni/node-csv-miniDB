// TODO: Obtain types and columns from the file and use that to validate the data coming in the rows argument before appending to file

import fs from "fs";
import path from "path";

import { z } from "zod";

import { validate } from "../../utils/validator";
import { format, deformat } from "../../utils/formatter";

export function addRow(data: {
  name: string;
  rows: {} | {}[];
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, rows } = data;

      validate(name, z.string());
      // if (rows) validate(rows, z.object());
      if (!Array.isArray(rows)) rows = [rows];

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

        const rl = require("readline").createInterface({
          input: readStream,
          crlfDelay: Infinity
        });
    
        const lines: string[] = [];
        let lineCount = 0;
    
        rl.on('line', (line: string) => {
          console.log(lineCount);

          lines.push(line);
          lineCount++;
              
          if (lineCount >= 2) rl.close();
        });
    
        rl.on('close', () =>{
          lines.map((el)=>{
            console.log(deformat(el));
            
          })
          
          rl.removeAllListeners()
        });

        rl.on("error", (err: NodeJS.ErrnoException) => reject(err));

        readStream.on("error", (err) => {
          reject(new Error(`Error reading the source file: ${err.message}`));
        });

        writeStream.on("error", (err) => {
          reject(new Error(`Error writing to destination file: ${err.message}`));
        });

        writeStream.on("finish", () => {
          const writeStream = fs.createWriteStream(tempFilePath, {
            flags: "a",
          });

          // writeStream.write(format(rows).join("\n") + "\n", () => {
          //   writeStream.end();
          // });

          writeStream.on("error", (err) => {
            reject(new Error(`Error writing to file: ${err.message}`));
          });

          writeStream.on("finish", () => {
            fs.rename(tempFilePath, name, (err) => {
              if (err) {
                return reject(
                  new Error(`Error replacing original file: ${err.message}`)
                );
              }
              resolve(`Column added successfully to '${name}'`);
            });
          });
        });

        readStream.pipe(writeStream);
      });
    } catch (err) {
      reject(err);
    }
  });
}