const MongoClient = require('mongodb').MongoClient;
 
// Connection URL
const url = 'mongodb://heroku_75478npq:c6o9r56qtje5dvcapii4odrlni@ds161162.mlab.com:61162/heroku_75478npq';
 
// Database Name
const dbName = 'heroku_75478npq';

var Db = {};
var db = null;
 
// Use connect method to connect to the server
Db.connect = function(fn) {
return new Promise(function(res) {
if(db) return res(db);
MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
  if(err) throw err;
  console.log("Connected successfully to server");
 
  db = client.db(dbName);
  res(db);
//  db.collection('orders').find({}).toArray(function(err, doc) {
//    console.log(doc);
//  });
  //client.close();
});
});
}

module.exports = Db;
