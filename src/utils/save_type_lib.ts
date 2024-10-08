import fs from "fs";
import path from "path";

export default (lib_name: string, content: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.posix.join("./store/type_lib", lib_name) + ".json",
        JSON.stringify(content),
        (err) => {
          if (err) reject(new Error("Failed to write type lib: " + err.message));
          else resolve();
        }
      );
    });
  };