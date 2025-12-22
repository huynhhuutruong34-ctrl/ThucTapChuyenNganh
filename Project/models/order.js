const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    customer: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        payment: { type: String, required: true }
    },
    items: [
        {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            qty: { type: Number, required: true }
        }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "pending" }
}, {
    timestamps: true
});

// Tránh lỗi tạo lại model khi hot reload hoặc import nhiều lần
module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);