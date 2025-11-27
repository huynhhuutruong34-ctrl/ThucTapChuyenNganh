const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    }
});
//const User = mongoose.model('User', userSchema);
//module.exports = User;
module.exports = mongoose.model('users', UserSchema);