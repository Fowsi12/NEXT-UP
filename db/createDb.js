import { connect } from "/connect.js";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

console.log("server is running, creating database...");

console.log("Dropping existing tables...");

await db.end();
console.log("Database successfully recreated.");