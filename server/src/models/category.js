const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    categoryId: {
        type: String,
        unique: true,
    },
    categoryName: {
        type: String,
        //required: true,
    },
    userId: {
        type: String,
    },
});

CategorySchema.pre('save', async function (next) {
    if (!this.categoryId) {
        this.categoryId = '#' + Math.floor(1000 + Math.random() * 9000);
    }
    next();
});

module.exports = mongoose.model('Category', CategorySchema);
