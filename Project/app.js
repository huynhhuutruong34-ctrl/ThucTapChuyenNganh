var createError = require('http-errors');
var express = require('express');
const {engine}= require('express-handlebars');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
app.engine(
    'hbs',
    engine( {
    extname: '.hbs',
    defaultLayout: 'layouts',
    partialsDir: path.join(__dirname, 'views','partials'),
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
})
);

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var shopRouter = require('./routes/shop');
var usersRouter = require('./routes/users');
const {Router} = require('express');
// var testRouter = require('./routes/admin');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/shop',shopRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
//app.use('/admin/test', testRouter);




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//database connect

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('./models/User');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://127.0.0.1/node")
    .then(()=> {
        console.log("MongoDB Connected successfully.   ");
    })
    .catch((err)=> {
        console.error("MongoDB Connected failed " , err);
    });

app.post('/login', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if (user) {
            bcryptjs.compare(req.body.password,user.password,(err,matched)=>{
                if(err) return err;
                if(matched){
                    res.send("User was logged in");
                }else {
                    res.send("User was not logged in");
                }
            })
        }
    })
});
app.post('/register',  (req,res) => {
    console.log(req.body);
    const newUser = new User();
        newUser.email = req.body.email;
        newUser.password = req.body.password;
        bcryptjs.genSalt(10, function (err, salt) {
            bcryptjs.hash(newUser.password, salt, function (err, hash) {
                if (err) {return  err}
                newUser.password = hash;

                newUser.save().then(userSave=>
                {
                    res.send('USER SAVED');
                }).catch(err => {
                    res.send('USER ERROR'+err);
                });
            });
        });
    }
);
// catch 404 and forward to error handler
app.use(function(req,
                 res, next) {
    next(createError(404));
});
module.exports = app;
