const fs = require("fs");
const path = require("path");

import { z } from "zod";

import Error from "../utils/models/error";
import { Name, Data } from "../utils/models/create";
import { format } from "../utils/formatter";


function createTable(
  name: z.infer<typeof Name>,
  data: z.infer<typeof Data>
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof name !== "string" || name.trim() === "")
        return reject(new Error("Invalid table name provided"));

      if (data) {
        const schemaValidation = Data.safeParse(data);
        if (!schemaValidation.success)
          return reject(new Error(`${schemaValidation.error.message}`));
      }

      name = path.join("./store", name).replace(/\\/g, "/");
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
          fs.appendFile(
            name,
            (data.includes("id") ? "" : "id,") + format(data.join() + "\n"),
            (err: Error) => {
              if (err)
                return reject(
                  new Error("Failed to append data to file: " + err.message)
                );
              resolve("Table and columns created successfully");
            }
          );
        } else {
          const keys =
            format((Object.keys(data).includes("id") ? "" : "id,") +
            Object.keys(data).join(",") +
            "\n");
          fs.appendFile(name, keys, (err: Error) => {
            if (err)
              return reject(
                new Error("Failed to append columns to file: " + err.message)
              );
          });

          Object.keys(data).forEach((key) => {
            if (!Array.isArray(data[key])) {
              data[key] = [`${data[key]}`];
            }
          });

          const max_length = Math.max(
            ...Object.values(
              data as { [key: string]: string[] | number[] | boolean[] }
            ).map((value) => value.length)
          );

          const rows = [];
          for (let i = 0; i < max_length; i++) {
            let row: (string | number | boolean)[] = [
              Object.keys(data).includes("id") ? "" : i + 1,
            ];
            Object.values(
              data as { [key: string]: string[] | number[] | boolean[] }
            ).forEach((value) => {
              row.push(format(`${value[i] ?? ""}`));
            });
            rows.push(row.join(",") + "\n");
          }

          fs.appendFile(name, rows.join(""), (err: Error) => {
            if (err)
              return reject(
                new Error("Failed to append rows to file: " + err.message)
              );
            resolve("Table, columns, and rows created successfully");
          });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { createTable };