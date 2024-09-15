const fs = require("fs");
import Error from './utils/models/error'

const { initTable } = require("./lib/create")

fs.mkdir('./store', { recursive: true }, (err: Error) => {
    if (err) throw err;
});


initTable("se", [1,2, 3])