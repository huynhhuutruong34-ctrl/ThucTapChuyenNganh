var express = require('express');
var router = express.Router();
const Category = require('../models/category');
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/Order');
const Contact = require('../models/contact');
const Setting = require('../models/setting');


function useAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Proceed if authenticated
    } else {
        res.redirect('/login'); // Redirect to login if authentication fails
    }
}
router.all('/*', useAuthenticated, (req, res, next) => {
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

/* DASHBOARD */
router.get('/', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();

        // khách hàng đã từng đặt hàng
        const customers = await Order.distinct('customer.name'); // dùng customer.name
        const totalCustomers = customers.length;

        // tổng doanh thu
        const revenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$total" } // dùng total, ko phải totalPrice
                }
            }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        res.render('admin/index', {
            title: 'Admin Dashboard',
            totalProducts,
            totalOrders,
            totalCustomers,
            totalRevenue
        });
    } catch (err) {
        console.error(err);
        res.render('admin/index', { title: 'Admin Dashboard' });
    }
});

// Route hiển thị danh sách sản phẩm từ categories
router.get('/product', async (req, res) => {
    try {
        await syncProductsFromCategories();

        const products = await Product.find().lean();
        const totalValue = products.reduce((acc, item) => acc + (item.price * item.qty), 0);
        const totalQty = products.reduce((acc, item) => acc + item.qty, 0);

        res.render('admin/product/product-list', {
            products,
            totalValue,
            totalQty
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


async function syncProductsFromCategories() {
    const categories = await Category.find().lean();
    const products = await Product.find().lean();

    const categoryIds = categories.map(c => c._id.toString());
    const productIds = products.map(p => p._id.toString());

    // --- Thêm Product mới từ Category ---
    for (const cat of categories) {
        if (!productIds.includes(cat._id.toString())) {
            const product = new Product({
                _id: cat._id,
                name: cat.name,
                price: cat.price || 0,
                qty: cat.qty || 0,
                image: cat.image || '',
                description: cat.description || ''
            });
            await product.save();
        } else {
            // --- Cập nhật Product nếu Category thay đổi ---
            await Product.findByIdAndUpdate(cat._id, {
                name: cat.name,
                price: cat.price || 0,
                image: cat.image || '',
                description: cat.description || ''
            });
        }
    }

    // --- Xóa Product nếu Category đã bị xóa ---
    for (const prod of products) {
        if (!categoryIds.includes(prod._id.toString())) {
            await Product.findByIdAndDelete(prod._id);
        }
    }
}



// Route chuyển category thành product và lưu vào products
router.post('/product/save-from-category/:id', async (req,res)=>{
    try{
        const cat = await Category.findById(req.params.id);
        if(!cat) return res.status(404).send('Category không tồn tại');

        const product = new Product({
            name: cat.name,
            price: cat.price,
            qty: cat.qty,
            image: cat.image
        });

        await product.save();
        res.redirect('/admin/product'); // quay lại danh sách
    }catch(err){
        console.error(err);
        res.status(500).send('Lỗi lưu product');
    }
});
// Cập nhật số lượng tồn kho
router.post('/product/update-qty', async (req, res) => {
    try {
        const { productId, qty } = req.body;

        if (!productId || qty === undefined) return res.status(400).send('Dữ liệu không hợp lệ');

        // Kiểm tra xem product đã có trong products chưa
        let product = await Product.findById(productId);

        if (!product) {
            // Nếu chưa có, lấy dữ liệu từ categories
            const Category = require('../models/category'); // hoặc đường dẫn đúng
            const cat = await Category.findById(productId).lean();

            if (!cat) return res.status(404).send('Sản phẩm không tồn tại trong categories');

            // Tạo document mới trong products
            product = new Product({
                _id: cat._id,      // dùng id từ category
                name: cat.name,
                price: cat.price || 0,
                qty: Number(qty)
            });

            await product.save();
        } else {
            // Nếu đã có, chỉ cập nhật qty
            product.qty = Number(qty);
            await product.save();
        }

        res.redirect('/admin/product');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
router.post('/product/update-qty-ajax', async (req, res) => {
    try {
        const { productId, qty } = req.body;

        if (!productId || qty === undefined) {
            return res.json({ success: false, error: 'Dữ liệu không hợp lệ' });
        }

        let product = await Product.findById(productId);

        if (!product) {
            // Nếu chưa có product trong DB, tạo mới từ categories
            const Category = require('../models/category');
            const cat = await Category.findById(productId).lean();
            if (!cat) return res.json({ success: false, error: 'Sản phẩm không tồn tại' });

            product = new Product({
                _id: cat._id,
                name: cat.name,
                price: cat.price || 0,
                qty: Number(qty)
            });

            await product.save();
        } else {
            product.qty = Number(qty);
            await product.save();
        }

        // Cập nhật tổng
        const products = await Product.find().lean();
        const totalValue = products.reduce((acc, item) => acc + item.price * item.qty, 0);
        const totalQty = products.reduce((acc, item) => acc + item.qty, 0);

        res.json({ success: true, qty: product.qty, totalValue, totalQty });
    } catch (err) {
        console.error(err);
        res.json({ success: false, error: 'Server Error' });
    }
});

/* CREATE ORDER */
router.post('/', async (req,res)=>{
    console.log('req.body:', req.body);
    try{
        const { customer, items } = req.body;
        if(!customer || !items || items.length===0){
            console.log("Dữ liệu không hợp lệ");
            return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
        }

        const total = items.reduce((sum,i)=>sum+i.price*i.qty,0);
        const order = new Order({ customer, items, total });
        await order.save();
        console.log("Order saved:", order);
        res.json({ success: true, orderId: order._id });
    } catch(err){
        console.error("Lỗi server:", err);
        res.status(500).json({ error: "Lỗi server" });
    }
});


// routes/admin.js
router.get('/order', async (req, res) => {
    try {
        const orders = await Order.find({}).lean();
        res.render('admin/order/order', { orders });  // <-- dùng order.hbs
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Lỗi server khi load đơn hàng');
    }
});


router.post('/order/update-status', async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order không tồn tại' });

        order.status = status;
        await order.save();

        res.json({ success: true, status: order.status });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

router.get('/order/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).send('Order không tồn tại');

        res.render('admin/order/order-detail', { order });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
    }
});
router.post('/order/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true } // trả về document mới
        ).lean();
        res.json({ success: true, status: order.status });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Không cập nhật được' });
    }
});
router.get('/contact/contact-message', async (req, res) => {
    try {
        const contacts = await Contact.find().lean();
        res.render('admin/contact/contact-message', {
            contacts
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET contact setting
router.get('/settings/contact-setting', async (req, res) => {
    const setting = await Setting.findOne().lean();
    res.render('admin/settings/contact-setting', { setting });
});

// POST contact setting  BẮT SAVE
router.post('/settings/contact-setting', async (req, res) => {
    console.log('POST CONTACT SETTING:', req.body); //  TEST

    await Setting.findOneAndUpdate(
        {},
        req.body,
        { upsert: true }
    );

    res.redirect('/admin/settings/contact-setting');
});

/* GET pages-setting */
router.get('/settings/pages-setting', async (req, res) => {
    const setting = await Setting.findOne().lean();
    res.render('admin/settings/pages-setting', { setting });
});

/* POST pages-setting */
router.post('/settings/pages-setting', async (req, res) => {
    await Setting.findOneAndUpdate({}, req.body, {
        upsert: true
    });
    res.redirect('/admin/settings/pages-setting');
});

// 👇 Route xem chi tiết sản phẩm (Category)
router.get('/category-detail/:id', async (req, res) => {
    try {
        const product = await Category.findById(req.params.id).lean();
        if (!product) return res.status(404).send('Sản phẩm không tồn tại');
        res.render('admin/category/category-detail', {
            product,
            title: product.name
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi server');
    }
});





module.exports = router;
