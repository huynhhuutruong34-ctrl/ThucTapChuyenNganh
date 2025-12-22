var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Category = require('../models/category');
const Product = require('../models/product');
const Order = require('../models/order');

const bcryptjs = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
router.all('/*', function(req,
                          res, next) {
    res.app.locals.layout='home';
    next();
})
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home/index', { title: 'Express' });
});

router.get('/pages', function(req, res, next) {
    res.render('home/pages', { title: 'Trang' });
});
router.get('/shop', async (req, res) => {
    try {
        const products = await Category.find({ status: true }).lean();

        res.render('home/shop', {
            title: 'Cửa hàng',
            products,
            user: req.user || null   // passport tự gắn vào khi login thành công
        });
    } catch (err) {
        console.log(err);
        res.send('Load shop failed');
    }
});

// router.get('/shop', function(req, res, next) {
//     res.render('home/shop', { title: 'Cửa hàng' });
// });

router.get('/contact', function(req, res, next) {
    res.render('home/contact', { title: 'Liên Hệ' });
});

//APP LOGIN
passport.use(new LocalStrategy({usernameField: 'email'}, function (email, password, done) {
    User.findOne({email: email}).then(user => {
        if (!user)
            return done(null, false, {message: 'User not found'});

        bcryptjs.compare(password, user.password, (err, matched) => {
            if (err) return err;
            if (matched) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Wrong email or password'});
            }
        });

    });
}));

router.get('/login', function(req, res, next) {
    res.render('home/login', { title: 'Login NFlowers' });
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);

});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user); // Pass the user to the done callback
    } catch (err) {
        done(err); // Pass the error to the done callback if an error occurred
    }
});
router.get('/forget', function(req, res, next) {
    res.render('home/forget', { title: 'Forget NFlowers' });
});

router.get('/signup', function(req, res, next) {
    res.render('home/signup', { title: 'Sign NFlowers' });
});
router.post('/signup', function(req, res, next) {
    let errors = [];
    if (!req.body.firstName) {
        errors.push({message: 'First name is required '});
    }
    if (!req.body.lastName) {
        errors.push({message: 'Last name is required'});
    }
    if (!req.body.email) {
        errors.push({message: 'E-mail is required'});
    }

    if (errors.length > 0) {
        res.render('home/signup', {
            title: 'Signup',
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password
        });
    } else {
        User.findOne({email: req.body.email}).then((user) => {
            if (!user) {
                const newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                });
                bcryptjs.genSalt(10, function (err, salt) {
                    bcryptjs.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(saveUser => {
                            req.flash('success_message', 'Successfully registered!');
                            res.redirect('/login');//or /login
                        });
                    })
                })
            } else {
                req.flash('error_message', 'E-mail is exist!');
                res.redirect('/signup');
            }

        });

    }
});

// router.get('/cart', function(req, res, next) {
//     res.render('home/cart', { title: 'Giỏ Hàng NFlowers' });
// });
router.get('/cart', function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }

    res.render('home/cart', {
        title: 'Giỏ Hàng NFlowers',
        user: req.user
    });
});
router.get('/bill/:id', async (req, res) => {
    const order = await Order.findById(req.params.id).lean();
    if(!order) return res.status(404).send("Không tìm thấy hóa đơn");
    res.render('home/bill', { title: 'Hóa đơn', order });
});




module.exports = router;
