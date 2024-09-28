import fs from 'fs'

import { createTable } from "./lib/create";
import { addRow, addColumn, removeColumn } from './lib/update';
import { deleteTable } from "./lib/delete";

fs.mkdir("./store", { recursive: true }, (err) => {
  if (err) throw err;
});

const content = {
  name: [
    "Tunmise",
    "Folake",
    "Bola",
    "Ademola",
    "Chika",
    "Kemi",
    "Adebayo",
    "Nneka",
    "Tunde",
    "Yewande",
    "Ifeanyi",
    "Gbenga",
    "Uche",
    "Bimpe",
    "Seyi",
  ],
  age: [21, 19, 25, 30, 27, 22, 35, 29, 26, 23, 32, 24, 28, 22, 31],
  height: [
    "6'3",
    "5'7",
    "5'9",
    "5'10",
    "6'0",
    "5'4",
    "5'11",
    "5'6",
    "6'2",
    "5'5",
    "5'8",
    "6'1",
    "5'3",
    "5'6",
    "5'11",
  ],
  phone: [
    "Samsung",
    "iPhone",
    "Google Pixel",
    "OnePlus",
    "Xiaomi",
    "iPhone",
    "Samsung",
    "Google Pixel",
    "Samsung",
    "Huawei",
    "OnePlus",
    "iPhone",
    "Samsung",
    "Xiaomi",
    "Google Pixel",
  ],
  laptop: [
    "MacBook Pro",
    "HP Spectre",
    "Dell XPS",
    "Lenovo ThinkPad",
    "MacBook Air",
    "Dell XPS",
    "Asus ZenBook",
    "HP Pavilion",
    "MacBook Pro",
    "Surface Laptop",
    "Lenovo ThinkPad",
    "Dell XPS",
    "MacBook Air",
    "Asus ZenBook",
    "HP Spectre",
  ],
  occupation: [
    "Software Developer",
    "Designer",
    "Product Manager",
    "Data Analyst",
    "Engineer",
    "Researcher",
    "Project Manager",
    "HR Specialist",
    "Marketing",
    "Consultant",
    "Sales Manager",
    "Architect",
    "Doctor",
    "Nurse",
    "Lawyer",
  ],
  country: [
    "Nigeria",
    "Ghana",
    "Kenya",
    "South Africa",
    "United States",
    "United Kingdom",
    "Germany",
    "France",
    "Canada",
    "India",
    "Australia",
    "Brazil",
    "Mexico",
    "Italy",
    "Japan",
  ],
  email: [
    "tunmise@example.com",
    "folake@example.com",
    "bola@example.com",
    "ademola@example.com",
    "chika@example.com",
    "kemi@example.com",
    "adebayo@example.com",
    "nneka@example.com",
    "tunde@example.com",
    "yewande@example.com",
    "ifeanyi@example.com",
    "gbenga@example.com",
    "uche@example.com",
    "bimpe@example.com",
    "seyi@example.com",
  ],
  salary: [
    55000, 45000, 60000, 75000, 70000, 50000, 85000, 52000, 62000, 58000, 65000,
    71000, 47000, 53000, 82000,
  ],
  marital_status: [
    "Single",
    "Married",
    "Single",
    "Married",
    "Single",
    "Married",
    "Single",
    "Single",
    "Single",
    "Married",
    "Single",
    "Single",
    "Married",
    "Married",
    "Single",
  ],
};

// createTable({ name: "users", content })
//   .then((message: string) => {
//     console.log(message);
//     // readTable("users")
//     //   .then((message: string[]) => {
//     //     console.log(message);
//     //   })
//     //   .catch((error: Error) => console.error(error.message));
//   })
//   .catch((error: Error) => console.error(error.message));

removeColumn({name: "users", column: "phone"})
  .then((message: string) => {
    console.log(message);
  })
  .catch((error: Error) => console.error(error.message));


// addRow({name: "users", rows: "country_music"})
//   .then((message: string) => console.log(message))
//   .catch((error: Error) => console.error(error.message));
