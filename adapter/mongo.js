const objectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
 
const url = process.env.MONGO_URL; 
const dbName = process.env.MONGO_DB_NAME;

var Db = {};
var db = null;
 
Db.connect = function(fn) {
  return new Promise(function(res) {
    if(db) return res(db);
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
      if(err) throw err;
      console.log("Connected successfully to server");
   
      db = client.db(dbName);
      res(db);
    });
  });
}

Db.genId = function() {
  return (new objectID()).toHexString();
}

Db.init = function() {
  Db.connect().then(function(db) {
    db.collection('transactions').createIndex({objectId: 1, objectType: 'text', tstamp: -1}, { unique:true }, function(err, idx) {
      if(err) console.error(err);
      else console.log('index created');
    });
  });
}

module.exports = Db;
