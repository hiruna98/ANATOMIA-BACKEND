const mongoose = require('mongoose');

const organSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    description: String,
    layer: String,
    organImage: String
});

module.exports = mongoose.model('Organ',organSchema);