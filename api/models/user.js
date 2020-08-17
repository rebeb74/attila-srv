const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    isAdmin: Boolean,
    share: [String],
    createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('user', userSchema);