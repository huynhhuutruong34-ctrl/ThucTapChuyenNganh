var express = require('express');
var router = express.Router();

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
router.get('/category', function(req, res, next) {
    res.render('admin/category/category-list', {title: 'Category'}) ;
});
router.get('/product', function(req, res, next) {
    res.render('admin/product/product-list', {title: 'Product'}) ;
});

module.exports = router;