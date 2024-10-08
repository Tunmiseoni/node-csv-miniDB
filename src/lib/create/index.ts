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

  try {
    let { name, content, types } = data;

    validate(name, z.string());
    if (content) validate(content, ContentSchemaUnion);
    if (types) validate(types, z.record(z.string()));

    let lib_name = name;
    name = path.posix.join("./store", name);
    if (!name.endsWith(".csv")) name += ".csv";

    const fileExists = await new Promise<boolean>((resolve) => {
      fs.stat(name, (err) => resolve(!err));
    });

    if (fileExists) {
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

    unlockFile = await lockfile.lock(name, { retries: 3 });
    
    if (!unlockFile) throw new Error("Failed to acquire lock on the file.");

    if (!content) {
      await new Promise<void>((resolve, reject) => {
        fs.appendFile(name, "", (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      return "Table created successfully";
    }

    if (ContentSchema.headers_only.safeParse(content).success) {
      console.log(`Entered 'headers_only' block for table: ${lib_name}`);
      await appendHeadersAndData(
        name,
        format(content as z.infer<(typeof ContentSchema)["headers_only"]>)
      );
      await saveTypeLib(lib_name, content as string[]);
      return "Table created successfully";
    }

    if (ContentSchema.headers_and_types.safeParse(content).success) {
      console.log(`Entered 'headers_and_types' block for table: ${lib_name}`);
      validate(Object.values(content), z.array(Types));
      await appendHeadersAndData(name, format(Object.keys(content)));
      await saveTypeLib(lib_name, content);
      return "Table created successfully";
    }

    if (ContentSchema.headers_and_content.safeParse(content).success) {
      console.log(`Entered 'headers_and_content' block for table: ${lib_name}`);
      let contentData = content as Record<
        string,
        string | number | boolean | string[] | number[] | boolean[]
      >;

      const keys = Object.keys(contentData);
      Object.keys(contentData).forEach((key) => {
        if (!Array.isArray(contentData[key])) contentData[key] = [`${contentData[key]}`];
      });

      const maxLength = Math.max(
        ...Object.values(contentData as { [key: string]: string[] | number[] | boolean[] }).map((value) => value.length)
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

      await appendHeadersAndData(name, format(keys) as string[], rows);

      if (types) {
        validate(Object.values(types), z.array(Types));
        if (
          !Object.keys(types).every((item) =>
            Object.keys(contentData).includes(item)
          )
        ) {
          return Promise.reject(
            new Error(
              "A parameter in types object doesn't match or isn't present in content object"
            )
          );
        }
        await saveTypeLib(lib_name, contentData);
      }
      return "Table created successfully";
    } else {
      return Promise.reject(
        new Error("Content passed does not match requested format")
      );
    }
  } catch (err) {
    throw new Error(`Error creating table: ${err}`);
  } finally {
    if (unlockFile) await safelyUnlock(unlockFile);
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