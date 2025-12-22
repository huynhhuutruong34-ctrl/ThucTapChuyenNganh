var express = require('express');
var router = express.Router();
const Category = require('../models/category');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

router.get('/', function(req, res) {
    Category.find({})
        .then(categories => {
            const data = categories.map((cat, index) => ({
                ...cat.toObject(),
                stt: index + 1, //tao stt
            }));

            res.render('admin/category/category-list', { categories: data });
        })
        .catch(err => {
            console.log(err);
            res.send('Error loading category');
        });
});


router.get('/create', function(req, res) {
    res.render('admin/category/create');
});

router.post('/create', function(req, res) {
    const newCategory = new Category({
        name: req.body.name,
        image: req.body.image.trim(),
        status: req.body.status === 'true',
        price:req.body.price
    });

    newCategory.save()
        .then(() => res.redirect('/admin/category'))
        .catch(err => res.send(err));
});

router.get('/edit/:id', function(req, res) {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render('admin/category/edit',
            {title: 'Edit Category', category: category.toObject()});
    })
});
router.put('/edit/:id', async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            image: req.body.image,
            price: req.body.price,
            status: req.body.status === 'true'
        });

        res.redirect('/admin/category');
    } catch (err) {
        console.log(err);
        res.send('Update failed');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.redirect('/admin/category');
    } catch (err) {
        console.log(err);
        res.send('Delete failed');
    }
});


module.exports = router;
