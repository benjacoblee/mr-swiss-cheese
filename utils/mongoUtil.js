require("dotenv").config();
const { MongoClient } = require("mongodb");
const uri = process.env.MONGO_URI;

let _db;

module.exports = {
  connectToServer: (callback) => {
    MongoClient.connect(uri, { useNewUrlParser: true }, function (err, client) {
      _db = client.db();

      return callback(err, client);
    });
  },

  getDB: () => {
    return _db;
  },
};
