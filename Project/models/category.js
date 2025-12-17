const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    // email: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     trim: true,
    //     minlength: 5,
    // },
    // password: {
    //     type: String,
    //     required: true,
    //     minlength: 5,
    // }
    name: {
        type:String,
        required:true,
    },
    image: {
        type:String,
        required:true,
    },
    status: {
        type:String,
        required:true,
    },

});
//const User = mongoose.model('User', userSchema);
//module.exports = User;
module.exports = mongoose.model('category', UserSchema);
