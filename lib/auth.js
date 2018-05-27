var hash = require('pbkdf2-password')();
var User = require('../lib/user');

var Auth = {};

Auth.login = function(username, password, fn) {
  User.find(username, function(err, user) {
  if (!user) return fn(null, null);
  hash({ password: password, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  });
  });
}

module.exports = Auth;

