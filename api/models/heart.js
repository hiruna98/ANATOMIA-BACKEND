const mongoose = require('mongoose');

const heartSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    organImage: String
});

module.exports = mongoose.model('Heart',heartSchema);