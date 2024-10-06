import fs from "fs";
import path from "path";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { format } from "../../utils/formatter";
import { validate } from "../../utils/validator";
import Types from "../../utils/models/types";

const ContentSchema = {
  headers_only: z.array(z.string()),
  headers_and_types: z.record(z.string()),
  headers_and_content: z.record(
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.date(),
      z.object({}),
      z.array(z.string()),
      z.array(z.number()),
      z.array(z.boolean()),
      z.array(z.date()),
      z.array(z.object({})),
    ])
  ),
};
const ContentSchemaUnion = z.union([
  ContentSchema.headers_only,
  ContentSchema.headers_and_types,
  ContentSchema.headers_and_content,
]);

export function createTable(data: {
  name: string;
  content?: z.infer<typeof ContentSchemaUnion>;
  types?: z.infer<(typeof ContentSchema)["headers_and_types"]>;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      let { name, content, types } = data;

      validate(name, z.string());
      if (content) validate(content, ContentSchemaUnion);
      if (types) validate(types, z.record(z.string()));

      let lib_name = name;
      name = path.posix.join("./store", name);
      if (!name.endsWith(".csv")) name += ".csv";

      fs.stat(name, (err) => {
        if(err) console.log(err);
        
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
        } else if (ContentSchema["headers_only"].safeParse(content).success) {
          appendHeadersAndData(
            name,
            format(content as z.infer<(typeof ContentSchema)["headers_only"]>)
          )
            .then((message: string) => {
              fs.writeFile(
                path.posix.join("./store/type_lib", lib_name) + ".json",
                JSON.stringify(
                  (content as string[]).reduce((acc, el) => {
                    acc[el] = "any";
                    return acc;
                  }, {} as Record<string, string>)
                ),
                (err) => {
                  if (err)
                    reject(
                      new Error("Failed to write to file: " + err.message)
                    );
                }
              );
              resolve(message);
            })
            .catch((err) => reject(err));
        } else if (
          ContentSchema["headers_and_types"].safeParse(content).success
        ) {
          validate(Object.values(content), z.array(Types));

          appendHeadersAndData(name, format(Object.keys(content)))
            .then((message: string) => {
              fs.writeFile(
                path.posix.join("./store/type_lib", lib_name) + ".json",
                JSON.stringify(content),
                (err) => {
                  if (err)
                    reject(
                      new Error("Failed to write to file: " + err.message)
                    );
                }
              );

              resolve(message);
            })
            .catch((err) => reject(err));
        } else if (
          ContentSchema["headers_and_content"].safeParse(content).success
        ) {
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
            const row = [keys.includes("id") ? "" : uuidv4()];
            Object.values(content).forEach((value: any) => {
              if (typeof value[i] === "object")
                value[i] = JSON.stringify(value[i]);
              row.push(...format(`${value[i] ?? ""}`));
            });
            rows.push(row.join(",").replace(/[\r\n]+/g, "  ") + "\n");
          }

          appendHeadersAndData(name, format(keys) as string[], rows)
            .then((message: string) => {
              if (types) {
                validate(Object.values(types), z.array(Types));
                if (
                  !Object.keys(types).every((item) =>
                    Object.keys(content).includes(item)
                  )
                )
                  reject(
                    new Error(
                      "A parameter in types object doesnt match or isnt present in content object"
                    )
                  );

                fs.writeFile(
                  path.posix.join("./store/type_lib", lib_name) + ".json",
                  JSON.stringify(content),
                  (err) => {
                    if (err)
                      reject(
                        new Error("Failed to write to file: " + err.message)
                      );
                  }
                );
              }
              resolve(message);
            })
            .catch((err) => reject(err));
        } else {
          reject(new Error("Content passed does not match requested format"));
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
