var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var pagesRouter = require('./routes/pages');
var adminRouter = require('./routes/admin');
var productsRouter = require('./routes/product');

var app = express();

// --- Cấu hình Handlebars ---
app.engine(
    'hbs',
    exphbs.engine({
        extname: '.hbs',
        defaultLayout: 'home', // Dùng layout: views/layouts/home.hbs
        layoutsDir: path.join(__dirname, 'views', 'layouts'),
    })
);

// --- View engine setup ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.disable(cookieParser());

// --- Middleware ---
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/pages', pagesRouter);
app.use('/admin', adminRouter);
app.use('/product', productsRouter);

// --- 404 handler ---
app.use(function (req, res, next) {
    next(createError(404));
});

// --- Error handler ---
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
