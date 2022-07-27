var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var csrf = require('csurf');

const session = require('express-session');
//const crypto = require('crypto');

var indexRouter = require('./routes/index');
var api = require('./routes/api');
var autoinstall = require('./routes/autoinstall')

var app = express();

app.set("view engine", "pug")
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//csrf
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'jIK4ef3Fk7Ef',
    cookie: {maxAge : 1200000}
}));
app.use(csrf({cookie: false}));

app.use(function(req, res, next){
    res.locals.csrftoken = req.csrfToken();
    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/api', api);
app.use('/api/auto-install',autoinstall)


module.exports = app;
