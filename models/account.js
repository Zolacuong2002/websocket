var mongoose = require('mongoose');
var accountSchema = new mongoose.Schema({
    email: String,
    password: String,
    lastname: String,
    firstname:String,
});

module.exports = Account = mongoose.model('Account', accountSchema);