const sqlite3 = require("sqlite3").verbose();
var path = require("path");

const dbPath = path.join(__dirname, "./../database/recordonchain.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.configure("busyTimeout", 3000); // 设置 3 秒锁超时

module.exports = {
  db,
};
