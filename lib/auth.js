var hash = require('pbkdf2-password')();
var User = require('../lib/user');
module.exports = Auth;

function Auth(){}

Auth.login = function(username, password, fn) {
  User.find(username, function(err, user) {
  if (!user) return fn(new Error('cannot find user'));
  hash({ password: password, salt: user.salt }, function (err, pass, salt, hash) {
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  });
  });
}


