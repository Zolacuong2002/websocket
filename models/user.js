const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var UserSchema = Schema({
    uid: Boolean,
    msg: {type: String}
}, {timestamps: true})

const User = mongoose.model('User', UserSchema)
module.exports = User
