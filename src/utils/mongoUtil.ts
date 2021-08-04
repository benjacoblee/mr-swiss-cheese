require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

let _db;

export const connectToServer = (callback) => {
  MongoClient.connect(uri, { useNewUrlParser: true }, function (err, client) {
    if (err) throw new Error();

    _db = client.db();

    return callback(err, client);
  });
};

export const getDB = () => {
  return _db;
};
