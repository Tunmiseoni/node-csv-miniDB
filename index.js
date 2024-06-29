const fs = require("fs");

const { initTable, insertColumn } = require("./mod/create")

fs.mkdir('./store', { recursive: true }, (err) => {
    if (err) throw err;
});

initTable("first_table", {
    "omo": "also_omo",
    "not_omo": "wawu",
    "": "wo",
    "lksmd": "sadknasd"
})

// insertColumn()