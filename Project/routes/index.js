var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home/index', { title: 'Express' });
});

router.get('/admin', function(req, res, next) {
    res.render('admin/admin', { title: 'admin' });
});
module.exports = router;
