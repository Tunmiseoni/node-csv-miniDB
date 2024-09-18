const fs = require("fs");
const path = require("path");

import { z } from "zod";

import Error from "../utils/models/error";
import { Name, Data } from "../utils/models/create";
import { format } from "../utils/formatter";
import { validate } from "../utils/validator";

function createTable(
  name: z.infer<typeof Name>,
  data: z.infer<typeof Data>
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      validate(name, Name);
      if (data) validate(data, Data);

      name = path.posix.join("./store", name);
      if (!name.endsWith(".csv")) name += ".csv";

      fs.stat(name, (err: Error) => {
        if (!err)
          return reject(
            new Error(
              `The file or directory at './store/${name}' already exists.`
            )
          );
        if (err && err.code !== "ENOENT")
          return reject(
            new Error(`Error accessing file './store/${name}': ${err.message}`)
          );

        if (data == null || data == undefined) {
          fs.appendFile(name, "", (err: Error) => {
            if (err) return reject(err);
            resolve("Table created successfully");
          });
        } else if (Array.isArray(data)) {
          appendHeadersAndData(name, data);
        } else {
          const keys = Object.keys(data);
          Object.keys(data).forEach((key) => {
            if (!Array.isArray(data[key])) data[key] = [`${data[key]}`];
          });

          const maxLength = Math.max(
            ...Object.values(
              data as { [key: string]: string[] | number[] | boolean[] }
            ).map((value) => value.length)
          );

          const rows = [];
          for (let i = 0; i < maxLength; i++) {
            const row = [keys.includes("id") ? "" : i + 1];
            Object.values(data).forEach((value: any) => {
              row.push(value[i] ?? "");
            });
            rows.push(row.join(",") + "\n");
          }

          appendHeadersAndData(name, keys, rows)
            .then((message: string) => resolve(message))
            .catch((err) => reject(err));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { createTable };

const appendHeadersAndData = (
  name: z.infer<typeof Name>,
  keys: string[],
  rows: string[] = []
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const headers = (keys.includes("id") ? "" : "id,") + keys.join(",") + "\n";
    const content = headers + rows.join("");
    fs.appendFile(name, content, (err: Error) => {
      if (err) reject(new Error("Failed to write to file: " + err.message));
      resolve("Table created successfully");
    });
  });
};
