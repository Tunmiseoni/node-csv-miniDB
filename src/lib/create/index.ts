import fs from "fs";
import path from "path";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import lockfile from "proper-lockfile";

import Types from "../../utils/models/types";
import { format } from "../../utils/formatter";
import { validate } from "../../utils/validator";
import saveTypeLib from "../../utils/save_type_lib";
import safelyUnlock from "../../utils/safely_unlock_file";
import safelyLock from "../../utils/safely_lock_file";

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

export async function createTable(data: {
  name: string;
  content?: z.infer<typeof ContentSchemaUnion>;
  types?: z.infer<(typeof ContentSchema)["headers_and_types"]>;
}): Promise<string> {
  let unlockFile: (() => Promise<void>) | undefined;
  let { name, content, types } = data;

  try {
    validate(name, z.string().min(1, { message: "String cannot be empty" }));
    if (content) validate(content, ContentSchemaUnion);
    if (types) validate(types, z.record(z.string()));

    let lib_name = name;
    name = path.posix.join("./store", name);
    if (!name.endsWith(".csv")) name += ".csv";

    if (fs.existsSync(name)) {
      return Promise.reject(
        new Error(`The file or directory at './store/${name}' already exists.`)
      );
    }

    await new Promise<void>((resolve, reject) => {
      fs.writeFile(name, "", (err) => {
        if (err) return reject(new Error("Failed to create: " + err.message));
        resolve();
      });
    });

    unlockFile = await safelyLock(name);

    if (!content) {
      await new Promise<void>((resolve, reject) => {
        fs.appendFile(name, "", (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      return `Table: ${lib_name} created successfully`;
    }

    if (ContentSchema.headers_only.safeParse(content).success) {
      await appendHeadersAndData(
        name,
        format(content as z.infer<(typeof ContentSchema)["headers_only"]>)
      );
      await saveTypeLib(
        lib_name,
        (content as string[]).reduce((acc, el) => {
          acc[el] = "any";
          return acc;
        }, {} as Record<string, string>)
      );
      return `Table: ${lib_name} created successfully`;
    }

    if (ContentSchema.headers_and_types.safeParse(content).success) {
      validate(Object.values(content), z.array(Types.enum));
      await appendHeadersAndData(name, format(Object.keys(content)));
      await saveTypeLib(lib_name, content);
      return `Table: ${lib_name} created successfully`;
    }

    if (ContentSchema.headers_and_content.safeParse(content).success) {
      let contentData = content as Record<
        string,
        string | number | boolean | string[] | number[] | boolean[]
      >;

      const keys = Object.keys(contentData);
      Object.keys(contentData).forEach((key) => {
        if (!Array.isArray(contentData[key]))
          contentData[key] = [`${contentData[key]}`];
      });

      const maxLength = Math.max(
        ...Object.values(
          contentData as { [key: string]: string[] | number[] | boolean[] }
        ).map((value) => value.length)
      );

      const rows: string[] = [];
      for (let i = 0; i < maxLength; i++) {
        const row = [keys.includes("id") ? "" : uuidv4()];
        Object.values(contentData).forEach((value: any) => {
          if (typeof value[i] === "object") {
            value[i] = JSON.stringify(value[i]);
          }
          row.push(...format(`${value[i] ?? ""}`));
        });
        rows.push(row.join(",").replace(/[\r\n]+/g, "  ") + "\n");
      }

      if (types) {
        Object.keys(contentData).some((item) => {
          const typeKey = (types as Record<string, string>)[item];

          if (!(typeKey in Types.validationMap))
            throw new Error(
              `Invalid type '${typeKey}' for item '${item}'. Expected one of: ${Object.keys(
                Types.validationMap
              ).join(", ")}`
            );

          (contentData[item] as []).some(async (parameter) => {
            if (
              !Types.validationMap[
                typeKey as keyof typeof Types.validationMap
              ].safeParse(parameter).success
            ) {
              await safelyUnlock(unlockFile, name).then(() => {
                unlockFile = undefined;

                fs.unlink(name, (err) => {
                  console.log(`Attempting to delete file: ${name}`);
                  if (err)
                    throw new Error(
                      `Error deleting file '${name}': ${err.message}`
                    );

                  return Promise.reject(
                    new Error(
                      `Parameter '${parameter}' in '${item}' does not match the expected type '${typeKey}'.`
                    )
                  );
                });
              });
            }
          });
        });

        await appendHeadersAndData(name, format(keys) as string[], rows);
        await saveTypeLib(lib_name, types);
      } else {
        await appendHeadersAndData(name, format(keys) as string[], rows);
      }
      return `Table: ${lib_name} created successfully`;
    } else {
      return Promise.reject(
        new Error("Content passed does not match requested format")
      );
    }
  } catch (err) {
    throw new Error(
      `Error creating table: ${err instanceof Error ? err.message : err}`
    );
  } finally {
    if (unlockFile) await safelyUnlock(unlockFile, name);
  }
}

const appendHeadersAndData = (
  name: string,
  keys: string[],
  rows: string[] = []
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const headers = (keys.includes("id") ? "" : "id,") + keys.join(",") + "\n";
    const content = headers + rows.join("");
    fs.appendFile(name, content, async (err) => {
      await lockfile.unlock(name);
      if (err)
        return reject(new Error("Failed to write to file: " + err.message));
      resolve("Table created successfully");
    });
  });
};