const mongoose = require('mongoose')
const mongooseUniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String },
  online: { type: String, default: 'N' },
  socketId: { type: String },
  chatList: [String]
})

userSchema.plugin(mongooseUniqueValidator)

module.exports = mongoose.model('User', userSchema)
