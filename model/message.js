const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const messageSchema = mongoose.Schema({
  fromUserId: { type: ObjectId, required: true },
  toUserId: { type: ObjectId, required: true },
  date: { type: Date, default: new Date().toDateString() },
  text: { type: String, required: true },
  isRead: { type: Boolean, default: false }
})

module.exports = mongoose.model('Message', messageSchema)
