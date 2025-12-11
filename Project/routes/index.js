var express = require('express');
var router = express.Router();
const User = require('../models/User');
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

router.get('/shop', function(req, res, next) {
    res.render('home/shop', { title: 'Cửa hàng' });
});

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
    res.render('home/login', { title: 'Login N&Wool Flowers' });
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, () => {
        // Lưu user vào session để header nhận được user
        req.app.locals.user = req.user;

        res.redirect('/');   // Sau khi login → về trang chủ
    });
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
    res.render('home/forget', { title: 'Forget N&Wool Flowers' });
});

router.get('/signup', function(req, res, next) {
    res.render('home/signup', { title: 'Sign N&Wool Flowers' });
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

router.get('/cart', function(req, res, next) {
    res.render('home/cart', { title: 'Giỏ Hàng N&Wool Flowers' });
});

module.exports = router;
