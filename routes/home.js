var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  var user = req.session.user;
  res.render('home', {

  });
});

module.exports = router;
