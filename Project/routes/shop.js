var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/shop', function(req, res, next) {
    res.render('shop');
});
module.exports = router;