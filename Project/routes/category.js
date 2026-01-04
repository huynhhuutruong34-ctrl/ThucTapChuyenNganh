var express = require('express');
var router = express.Router();
const Category = require('../models/category');

router.all('/*', (req, res, next) => {
    res.app.locals.layout = 'admin';
    next();
});

// LIST
router.get('/', function(req, res) {
    Category.find({})
        .then(categories => {
            const data = categories.map((cat, index) => ({
                ...cat.toObject(),
                stt: index + 1, // tạo stt
            }));

            res.render('admin/category/category-list', { categories: data });
        })
        .catch(err => {
            console.log(err);
            res.send('Error loading category');
        });
});

// CREATE FORM
router.get('/create', function(req, res) {
    res.render('admin/category/create');
});

// CREATE POST
router.post('/create', function(req, res) {
    const newCategory = new Category({
        name: req.body.name,
        image: req.body.image.trim(),
        status: req.body.status === 'true',
        price: req.body.price,
        description: req.body.description // <-- lưu mô tả
    });

    newCategory.save()
        .then(() => res.redirect('/admin/category'))
        .catch(err => res.send(err));
});

// EDIT FORM
router.get('/edit/:id', function(req, res) {
    Category.findOne({_id: req.params.id}).then((category) => {
        res.render('admin/category/edit', {
            title: 'Edit Category',
            category: category.toObject()
        });
    });
});

// EDIT PUT
router.put('/edit/:id', async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, {
            name: req.body.name,
            image: req.body.image,
            price: req.body.price,
            status: req.body.status === 'true',
            description: req.body.description // <-- cập nhật mô tả
        });

        res.redirect('/admin/category');
    } catch (err) {
        console.log(err);
        res.send('Update failed');
    }
});

// DELETE
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