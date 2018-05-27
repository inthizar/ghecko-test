var express = require('express');
var router = express.Router();
var Auth = require('../lib/auth');
var User = require('../lib/user');


router.get('/', function(req, res, next) {
  if (req.session.user) {
    res.redirect('/');
    next();
  }
  res.render('login', { pageTitle: 'Login'});
});

router.post('/', function(req, res, next) {
  Auth.login(req.body.username, req.body.password, function(err, user) { 
    if (!user) {
      req.flash('error', 'Authentication failed');
      res.redirect('/login');
    }  else {
      req.session.regenerate(function(){
        req.session.user = user;
        res.redirect('/');
      });
    }
  });
  
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
});


module.exports = router;

