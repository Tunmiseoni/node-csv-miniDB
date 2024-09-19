const fs = require("fs");
const path = require("path");

import { z } from "zod";

import Error from "../utils/models/error";
import { Name } from "../utils/models/delete";

export function deleteTable(name: z.infer<typeof Name>): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // if (Array.isArray(name)) {
      //   const promises = name.map((el) => {
      //     el = path.join("./store", el).replace(/\\/g, "/");
      //     if (!el.endsWith(".csv")) el += ".csv";

      //     return new Promise((resolve, reject) => {
      //       fs.unlink(el, (err: Error) => {
      //         if (err) {
      //           if (err.code === "ENOENT")
      //             return reject(
      //               new Error(
      //                 `The file or directory at '${el}' does not exist.`
      //               )
      //             );
      //           return reject(
      //             new Error(`Error deleting file '${el}': ${err.message}`)
      //           );
      //         }
      //         resolve(`Table '${el}' deleted successfully`);
      //       });
      //     });
      //   });

      //   return Promise.all(promises)
      //     .then((messages) => resolve(messages.join("\n")))
      //     .catch(reject);
      // } else {
        name = path.join("./store", name).replace(/\\/g, "/");
        if (!(name as string).endsWith(".csv")) name += ".csv";

        fs.unlink(name, (err: Error) => {
          if (err) {
            if (err.code === "ENOENT")
              return reject(
                new Error(`The file or directory at '${name}' does not exist.`)
              );
            return reject(
              new Error(`Error deleting file '${name}': ${err.message}`)
            );
          }
          resolve(`Table '${name}' deleted successfully`);
        });
      // }
    } catch (err) {
      reject(err);
    }
  });
}

function deleteColumn(name: z.infer<typeof Name>): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      if (Array.isArray(name)) {

      } else {

      }
    } catch (err) {
      reject(err);
    }
  });
}
