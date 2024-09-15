// function insertColumn(path, columns) {
//     if (!path.includes(".csv")) path += ".csv";

//     columns = columns.join();

//     fs.appendFile(`./store/${path}`, columns + "\n", (err) => {
//         if (err) {
//             console.error('Failed to insert columns to file:', err);
//             return;
//         }
//         console.log('The columns were appended to file!');
//     });
// }