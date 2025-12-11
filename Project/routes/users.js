var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exist = await User.findOne({ email });
        if (exist) return res.render("home/signup", { error: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashed });
        await newUser.save();

        res.redirect('/login');

    } catch (error) {
        res.render("home/signup", { error: "Error creating account" });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.render("home/login", { error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.render("home/login", { error: "Wrong password" });

        // Save user into session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email
        };

        res.redirect('/');

    } catch (error) {
        res.render("home/login", { error: "Login failed" });
    }
});
module.exports = router;
