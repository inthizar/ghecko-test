require('dotenv').load();
var config = require('config');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser');
var csrf = require('csurf');
var helmet = require('helmet');
var hash = require('pbkdf2-password')();
var flash = require('connect-flash');

//var perform = require('./routes/perform');
var auth = require('./routes/auth');
var home = require('./routes/home');

var mongo = require('./adapter/mongo');
mongo.connect().then(function(db) {
db.collection('orders').find({}).toArray(function(err, doc) {
    console.log(doc);
  });  
});
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(flash());
app.use(helmet());
app.use(compression());
app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var staticOptions = { maxAge: '1h' };
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist'), staticOptions));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist'), staticOptions));
app.use(session({
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: true,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: 1000*60*process.env.SESSION_AGE, // 30 mins
    }
}));
app.use(csrf());
app.use(function(req, res, next) {
  res.locals._csrf = req.csrfToken();
  next();
});

app.use(function(req, res, next) {
  if (req.session.user) {
    res.locals.login = 1;
  } else if (req.path != '/login') {
    return res.redirect('/login');
  }
  next();
});

app.use(function(req, res, next){
  res.locals.error = req.flash('error') + '';
  res.locals.success = req.flash('success') + '';
  res.locals.info = req.flash('info') + '';
  res.locals.warning = req.flash('warning') + '';
  next();
});

app.use('/login', auth);
app.use('/', home);
//app.use('/perform', perform);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
