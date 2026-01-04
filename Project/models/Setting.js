const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    /* ===== CONTACT PAGE ===== */
    contactTitle: {
        type: String,
        default: 'Contact Us'
    },
    contactDescription: {
        type: String,
        default: 'We’d love to hear from you!'
    },
    contactImage: {
        type: String,
        default: ''
    },

    contactAddress: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    contactWorkingHours: {
        type: String,
        default: ''
    }

}, { timestamps: true });

module.exports =
    mongoose.models.Setting ||
    mongoose.model('Setting', settingSchema);
