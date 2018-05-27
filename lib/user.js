var mongo = require('../adapter/mongo');

module.exports = User;

function User(id, username, name, hash, salt) {
  this.id = id;
  this.username = username;
  this.name = name;
  this.hash = hash;
  this.salt = salt;
}

User.find = function(username, fn) {
  mongo.connect().then(function(db) {
    db.collection('user').find({username: username}).toArray(function(err, data) {
      if(err) throw err;
      if(!data || !data.length) return fn(null, null);
      fn(null, new User(...Object.values(data[0])));
    });
  });
}
