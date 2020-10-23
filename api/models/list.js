const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    listName: String,
    list: [{
        value: String,
        checked: Boolean,
        createdOn: {
            type: Date,
            default: Date.now
        }
    }],
    userId: String,
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('list', listSchema);