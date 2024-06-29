const fs = require("fs");
const isObject = require("../utils/is_object");

function initTable(name, data) {
    if (!name.includes(".csv")) name += ".csv";

    fs.stat(`./store/${name}`, (err, stats) => {
        if (!err) {
            console.error(`The file or directory at './store/${name}' already exists.`);
            return;
        } else {
            if(data == null){
                fs.writeFile(`./store/${name}`, '', (err) => {
                    if (err) {
                        console.error('Failed to create empty table:', err);
                        return;
                    }
                    console.log('Empty table created!');
                });
                return;
            }

            if (Array.isArray(data)) {
                fs.appendFile(`./store/${name}`, data.join() + "\n", (err) => {
                    if (err) {
                        console.error('Failed to append data to file:', err);
                        return;
                    }
                    console.log('Data was appended to file!');
                });
                return;
            }

            if (isObject(data)) {
                fs.appendFile(`./store/${name}`, Object.keys(data).join() + "\n", (err) => {
                    if (err) {
                        console.error('Failed to append data to file:', err);
                        return;
                    }
                    console.log('Data was appended to file!');
                });

                fs.appendFile(`./store/${name}`, Object.values(data).join() + "\n", (err) => {
                    if (err) {
                        console.error('Failed to append data to file:', err);
                        return;
                    }
                    console.log('Data was appended to file!');
                });
                return;
            }

            console.error(`Unexpected data type entered for data argument: ${typeof data}`);
        }
    });
}

// Uncomment and complete this function if needed
// function initRow(path, columns){
//     if(!path.includes(".csv")) path += ".csv"

//     columns = columns.join()

//     fs.appendFile(`./store/${path}`, columns, (err) => {
//         if (err) throw err;
//         console.log('The "data to append" was appended to file!');
//     });
// }

function insertColumn(path, columns) {
    if (!path.includes(".csv")) path += ".csv";

    columns = columns.join();

    fs.appendFile(`./store/${path}`, columns + "\n", (err) => {
        if (err) {
            console.error('Failed to insert columns to file:', err);
            return;
        }
        console.log('The columns were appended to file!');
    });
}

module.exports = { initTable, insertColumn };
