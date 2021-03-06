require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store');
const passport = require('passport');
const authenticate = require('./authenticate');
const config = require('./config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promoRouter = require('./routes/promoRouter');
const uploadRouter = require('./routes/uploadRouter');
const favRouter = require('./routes/favRouter');
const commentRouter = require('./routes/commentRouter');

const mongoose = require('mongoose');
const connect = mongoose.connect(config.mongoUrl);

connect.then((db) => {
  console.log('> Connected to mongoDB server');
}, err => console.log(err));

const app = express();

app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  res.redirect(307, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser('12345-67890'));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static('public'));

app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favRouter);
app.use('/comments', commentRouter);

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
