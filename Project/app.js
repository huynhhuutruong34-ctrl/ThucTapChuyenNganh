var createError = require('http-errors');
var express = require('express');
const methodOverride = require('method-override')
const { engine } = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'layouts',
    partialsDir: path.join(__dirname, 'views/partials'),
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: (a, b) =>{a === b} ,
        // tính tổng tiền 1 sản phẩm
        calcTotal: (price, qty) => {
            return (price * qty).toLocaleString() + '₫';
        },
        // format tổng tiền
        formatPrice: (price) => {
            return Number(price).toLocaleString() + '₫';
        }
    }
}));


app.set('view engine', 'hbs');


// Middleware session
app.use(session({
    secret: 'secret_key_for_session', // đổi thành gì đó bảo mật
    resave: true,
    saveUninitialized: true,
    // cookie: { maxAge: 1000 * 60 * 60 } // 1 giờ
}));
//methor override
app.use(methodOverride('_method'));
app.use(flash());
//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// You might also need custom middleware to make flash messages available in templates
app.use((req, res, next) => {
    res.locals.user = req.user ? req.user.toObject() : null;
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error'); // Passport.js often uses 'error'
    res.locals.errors = req.flash('errors');
    next();
});


var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var categoryRouter = require('./routes/category');
console.log(path.join(__dirname, 'views', 'layouts'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/admin/category', categoryRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);


//var shopRouter = require('./routes/shop');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {Strategy: LocalStrategy} = require("passport-local");
const User = require('./models/user');
const bcryptjs = require('bcryptjs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/node')
    .then(()=>{
        console.log("MongoDB connected successfully!");
    })
    .catch(err => {
        console.error("Error connecting to MongDB:", err);
    });

app.post('/login', (req, res) => {
    User.findOne({email: req.body.email}).then((user) => {
        if (user) {
            bcryptjs.compare(req.body.password,user.password,(err,matched)=>{
                if(err) return err;
                if(matched){
                    //res.send("User was logged in");
                    req.session.user =
                        {
                            id:user._id,
                            email:user.email,
                        };
                    res.redirect('/');
                }else {
                    res.send("Email hoac mat khau khong dung");
                }
            });
        }else{
            res.send("User khong ton tai");
        }
    })
});
app.post('/signup', async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        // kiểm tra user đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({
            email,
            phone,
            password: hashedPassword
        });

        await newUser.save();

        // trả về thông tin user (không trả password)
        const userData = {
            email: newUser.email,
            phone: newUser.phone
        };

        res.status(201).json({ message: "User registered", user: userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/'); // nếu lỗi vẫn redirect về trang chính
        }
        // Xóa cookie session
        res.clearCookie('connect.sid');
        // Sau đó redirect về login
        res.redirect('/login');
    });
});
const Order = require('./models/Order');

// POST tạo order
app.post('/order', async (req,res) => {
    try{
        const { customer, items } = req.body;
        if(!customer || !items || items.length === 0)
            return res.status(400).json({ error: "Dữ liệu không hợp lệ" });

        const total = items.reduce((sum,i)=> sum + i.price*i.qty, 0);

        const order = new Order({ customer, items, total });
        await order.save();

        res.json({ success:true, orderId: order._id });
    } catch(err){
        console.error(err);
        res.status(500).json({ error: "Lỗi server" });
    }
});

// GET hiển thị bill theo order ID
app.get('/bill/:id', async (req,res) => {
    try {
        const order = await Order.findById(req.params.id).lean();
        if(!order) return res.status(404).send("Không tìm thấy hóa đơn");

        res.render('bill', { order });
    } catch(err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
});





// view engine setup


app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});





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
