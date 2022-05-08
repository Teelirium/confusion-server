var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promoRouter = require('./routes/promoRouter');

const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('> Connected to mongoDB server');
}, err => console.log(err));

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890'));
app.use(session({
  name: 'sesh',
  secret: '12345',
  saveUninitialized: false,
  resave: false,
  Store: new FileStore(session),
}));

function auth(req, res, next) {
  console.log(req.session);
  if (!req.session.user) {      
    res.setHeader('WWW-Authenticate', 'Basic');
    let err = createError(401, 'You are not signed in');
    return next(err); 
  }
  else {
    if (req.session.user === 'authenticated') {
      return next();
    }
    else {
      res.setHeader('WWW-Authenticate', 'Basic');
      let err = createError(403, 'You are not signed in');
      return next(err);
    }
  }
}

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(auth);

app.use(express.static('public'));
app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);

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
