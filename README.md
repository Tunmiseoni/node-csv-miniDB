<h1 style="font-size: 2.5em;">node-csv-miniDB - { in progress }</h1>

<h2 style="font-size: 2em;">Overview</h2>
<p style="font-size: 1.2em;">
  node-csv-miniDB is a Node.js library designed to simplify CRUD (Create, Read, Update, Delete) operations on CSV files. Utilizing the built-in fs module, this lightweight and efficient wrapper provides an intuitive interface for managing CSV data as a mini database.
</p>

<h2 style="font-size: 2em;">Features</h2>
<ul style="font-size: 1.2em;">
  <li>Create Tables: Initialize new CSV files as tables.</li>
  <li>Insert Data: Add rows and columns to your CSV files effortlessly.</li>
  <li>Read Data: Retrieve and manipulate data stored in CSV files.</li>
  <li>Update Data: Modify existing entries within your CSV tables.</li>
  <li>Delete Data: Remove rows or columns from your CSV files.</li>
  <li>Error Handling: Robust error handling to manage file operations smoothly.</li>
</ul>

<h2 style="font-size: 2em;">Installation</h2>
<pre style="font-size: 1.2em;"><code>npm install node-csv-miniDB</code></pre>

<h2 style="font-size: 2em;">Usage</h2>
<pre style="font-size: 1.2em;"><code>
const { initTable, insertColumn } = require('node-csv-miniDB');

// Initialize a new CSV table
initTable('users', ['name', 'email', 'age']);

// Insert a new column
insertColumn('users.csv', ['address']);
</code></pre>

<h2 style="font-size: 2em;">Documentation</h2>
<p style="font-size: 1.2em;">
  For detailed usage instructions and API documentation, please refer to the <a href="https://github.com/yourusername/node-csv-miniDB/wiki">Wiki</a>.
</p>

<h2 style="font-size: 2em;">Contributing</h2>
<p style="font-size: 1.2em;">
  We welcome contributions! Please read our <a href="https://github.com/Tunmiseoni/node-csv-miniDB/blob/main/CONTRIBUTING.md">Contributing Guide</a> to learn how you can help improve node-csv-miniDB.
</p>

<h2 style="font-size: 2em;">License</h2>
<p style="font-size: 1.2em;">
  This project is licensed under the MIT License - see the <a href="https://github.com/Tunmiseoni/node-csv-miniDB/blob/main/LICENSE">LICENSE</a> file for details.
</p>
