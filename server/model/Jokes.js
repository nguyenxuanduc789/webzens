const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JokesSchema = new Schema({
    content: { type: String, required: true },
});

module.exports = mongoose.model('Jokes', JokesSchema);
    