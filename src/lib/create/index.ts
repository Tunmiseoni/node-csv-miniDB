import fs from "fs";
import path from "path";

import { z } from "zod";

import { format } from "../../utils/formatter";
import { validate } from "../../utils/validator";
// import { Name, Data } from "../../utils/models/create";

let Content = z.union([
  z.record(
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.array(z.number()),
      z.array(z.boolean()),
    ])
  ),
  z.array(z.string()),
]);

export function createTable(data: {
  name: string;
  content: z.infer<typeof Content>;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let { name, content } = data;

      validate(name, z.string());
      if (content) validate(content, Content);

      name = path.posix.join("./store", name);
      if (!name.endsWith(".csv")) name += ".csv";

      fs.stat(name, (err) => {
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

        if (content == null || content == undefined) {
          fs.appendFile(name, "", (err) => {
            if (err) return reject(err);
            resolve("Table created successfully");
          });
        } else if (Array.isArray(content)) {
          appendHeadersAndData(name, format(content) as string[])
            .then((message: string) => resolve(message))
            .catch((err) => reject(err));
        } else {
          let content = data.content as Record<
            string,
            string | number | boolean | string[] | number[] | boolean[]
          >;
          const keys = Object.keys(content);
          Object.keys(content).forEach((key) => {
            if (!Array.isArray(content[key]))
              content[key] = [`${content[key]}`];
          });

          const maxLength = Math.max(
            ...Object.values(
              content as { [key: string]: string[] | number[] | boolean[] }
            ).map((value) => value.length)
          );

          const rows = [];
          for (let i = 0; i < maxLength; i++) {
            const row = [keys.includes("id") ? "" : i + 1];
            Object.values(content).forEach((value: any) => {
              row.push(...format(`${value[i] ?? ""}`));
            });
            rows.push(row.join(",").replace(/[\r\n]+/g, "  ") + "\n");
          }

          appendHeadersAndData(name, format(keys) as string[], rows)
            .then((message: string) => resolve(message))
            .catch((err) => reject(err));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

const appendHeadersAndData = (
  name: string,
  keys: string[],
  rows: string[] = []
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const headers = (keys.includes("id") ? "" : "id,") + keys.join(",") + "\n";
    const content = headers + rows.join("");
    fs.appendFile(name, content, (err) => {
      if (err) reject(new Error("Failed to write to file: " + err.message));
      resolve("Table created successfully");
    });
  });
};
