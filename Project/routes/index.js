var express = require('express');
var router = express.Router();

/* GET home page. */
router.all('/*', function(
    req,
    res,
    next) {
    res.app.locals.layout = 'home';
    next();
});

router.get('/', function(req, res, next) {
    res.render('home/index', { title: 'Express' });
});
//
// router.get('/admin', function(req, res, next) {
//     res.render('admin/index', { title: 'admin' });
// });

router.get('/pages', function(req, res, next) {
    res.render('home/pages', { title: 'pages' });
});

router.get('/contact', function(req, res, next) {
    res.render('home/contact', { title: 'contact   ' });
});

router.get('/login', function(req, res, next) {
    res.render('home/login', { title: 'login ' });
});

router.get('/signup', function(req, res, next) {
    res.render('home/signup', { title: 'signup ' });
});
router.get('/cart', function(req, res, next) {
    res.render('home/cart', { title: 'cart ' });
});

module.exports = router;
