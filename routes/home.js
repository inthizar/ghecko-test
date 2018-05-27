var express = require('express');
var router = express.Router();
var csvjson = require('csvjson');
var Process = require('../lib/process');
var async = require('async');

router.all('/', function(req, res, next) {
  var user = req.session.user;
console.log(req.body);
  async.waterfall([
    function(cb) {
      if(req.method == 'POST') {
        Process.query(req.body.objectType, req.body.objectId, req.body.timestamp, function(err, result) {
          if(err) {res.locals.warning = 'an error occured'; return cb(err, {});}
          cb(null, result);
        });
      } else cb(null, null);
    }
  ], function(err, data) {
    res.render('process', { data: data}); 
  });
});

router.all('/upload', function(req, res, next) {
  if(req.method == 'POST') {
    if (!req.files || !req.files.uploadFile) {
      req.flash('warning', 'No files were uploaded.');
      return res.redirect('/upload');
      next();
    }
    var file = req.files.uploadFile;
    console.log(file);
    console.log(file.data.toString());
    var csvData = csvjson.toArray(file.data.toString(), {delimiter: ',', quote: '"'});  
    if(!csvData.length) {
      req.flash('warning', 'No data.');
      return res.redirect('/upload');
    }
    Process.loadData(csvData, function(err, result) {
      if(err) {console.error(err); req.flash('warning', 'failed.'+err.message);}
      if(!result.s) req.flash('warning', result.m);
      if(result.s) req.flash('success', result.m);
      res.redirect('/upload');
    });
  } else res.render('home', {});
});

module.exports = router;
