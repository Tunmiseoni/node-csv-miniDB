const fs = require("fs");
import Error from "../utils/models/error";
import Data from "../utils/models/data";

function initTable(name: string, data: Data) {
  if (!name.includes(".csv")) name += ".csv";

  fs.stat(`./store/${name}`, (err: Error) => {
    if (!err) {
      console.error(
        `The file or directory at './store/${name}' already exists.`
      );
      return;
    }

    if (err && err.code !== "ENOENT") {
      console.error(`Error accessing file './store/${name}':`, err);
      return;
    }

    if (Array.isArray(data)) {
      fs.appendFile(`./store/${name}`, data.join() + "\n", (err: Error) => {
        if (err) {
          console.error("Failed to append data to file:", err);
          return;
        }
        console.log("Data was appended to file!");
      });
      return;
    } else {
      const keys = Object.keys(data).join(",") + "\n";
      fs.appendFile(`./store/${name}`, keys, (err: Error) => {
        if (err) {
          console.error("Failed to append headers to file:", err);
          return;
        }
        console.log("Headers were appended to file!");
      });

      // Ensure each value in data is an array
      Object.keys(data).forEach((key) => {
        if (!Array.isArray(data[key])) {
          data[key] = [`${data[key]}`];
        }
      });

      const max_length = Math.max(
        ...Object.values(
          data as { [key: string]: (string | number | boolean)[] }
        ).map((value) => value.length)
      );

      // Prepare CSV rows and append to file
      const rows = [];
      for (let i = 0; i < max_length; i++) {
        let row: (string | number | boolean)[] = [];
        Object.values(
          data as { [key: string]: (string | number | boolean)[] }
        ).forEach((value) => {
          row.push(value[i] ?? "");
        });
        rows.push(row.join(",") + "\n");
      }

      fs.appendFile(`./store/${name}`, rows.join(""), (err: Error) => {
        if (err) {
          console.error("Failed to append data rows to file:", err);
          return;
        }
        console.log("Data rows were appended to file!");
      });
      return;
    }
  });
}

module.exports = { initTable };
