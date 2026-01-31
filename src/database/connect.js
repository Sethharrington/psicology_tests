const dotenv = require("dotenv");
dotenv.config();
const { MongoClient } = require("mongodb");

let database;
const initDb = (callback) => {
  if (database) return callback(database);
  MongoClient.connect(process.env.MONGODB_URI)
    .then((client) => {
      database = client.db(process.env.MONGODB_DB_NAME);
      console.log("Database connection established");
      return callback(null, database);
    })
    .catch((err) => {
      callback(err);
    });
};

const getDatabase = () => {
  if (!database) {
    throw new Error("Database not initialized. Call initDb first.");
  }
  return database;
};
module.exports = { initDb, getDatabase };
