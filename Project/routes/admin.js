var express = require('express');
var router = express.Router();
// function useAuthenticated(req, res, next) {
//     if (req.isAuthenticated()) {
//         return next(); // Proceed if authenticated
//     } else {
//         res.redirect('/login'); // Redirect to login if authentication fails
//     }
// }
router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin'; // Set layout for admin pages
    next();
});
/* GET home page. */
router.get('/*', function(
    req,
    res,
    next) {
    res.app.locals.layout = 'admin';
    next();
});

router.get('/', function(req, res, next) {
    res.render('admin/index', {title: 'Admin'}) ;
});

router.get('/product', function(req, res, next) {
    res.render('admin/product/product-list', {title: 'Product'}) ;
});
router.get('/test', function(req, res, next) {
    res.render('admin/test', {title: 'test'}) ;
});




module.exports = router;