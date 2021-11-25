'use strict'

const User = require('../model/user')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Message = require('../model/message')

class DbHandler {
  getAllUsers () {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await User.find({ }, 'username online _id email imageUrl chatList')
        resolve(users)
      } catch (err) {
        reject(err)
      }
    })
  }

  getUserById (userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const { _id, username, email, imageUrl } = await User.findById(mongoose.Types.ObjectId(userId))
        resolve({ _id, username, email, imageUrl })
      } catch (err) {
        reject(err)
      }
    })
  }

  createUser (username, email, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const hash = await bcrypt.hash(password, 10)
        const user = new User({ username, email, password: hash })
        await user.save()
        resolve({ userId: user._id, imageUrl: user.imageUrl, username: user.username })
      } catch (err) {
        reject(err)
      }
    })
  }

  loginUser (username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({ username: username })
        if (!user) {
          throw new Error('User not found')
        }
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
          throw new Error('Password mismatch')
        }
        resolve({ userId: user._id, imageUrl: user.imageUrl, username: user.username })
      } catch (err) {
        reject(err)
      }
    })
  }

  logoutUser (userId) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { socketId: '', online: 'N' })
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  }

  getUserInfo ({ userId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const { username, online, socketId, _id, imageUrl } = await User.findById(userId)
        resolve({ _id, username, online, socketId, imageUrl })
      } catch (err) {
        reject(err)
      }
    })
  }

  addSocketId ({ userId, socketId }) {
    return new Promise(async (resolve, reject) => {
      try {
        await User.updateOne({ _id: mongoose.Types.ObjectId(userId) }, { socketId, online: 'Y' })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  getChatList (userId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Get chatlist
        const chatList = await User.find({ socketId: userId }, 'chatList')
        // End get chatlist
        const users = await User.find({ socketId: { $ne: userId } }, 'username online _id')
        resolve(users)
      } catch (err) {
        reject(err)
      }
    })
  }

  getMessages ({ userId, toUserId }, { page, limit = 10 }) {
    return new Promise(async (resolve, reject) => {
      try {
        // get total documents in the Messages collection
        const MessageObjectCondition = {
          $or: [
            {
              $and: [
                { toUserId: userId },
                { fromUserId: toUserId }
              ]
            },
            {
              $and: [
                { toUserId: toUserId },
                { fromUserId: userId }
              ]
            }
          ]
        }

        const count = await Message.countDocuments(MessageObjectCondition)
        const totalPages = Math.ceil(count / limit)

        // validate page
        page = parseInt(page)
        if (!page || page === NaN) {
          page = totalPages
        }

        const messages = await Message.find(MessageObjectCondition)
          .sort({ date: 1 })
          .limit(limit * 1)
          .skip(Math.max((page - 1), 0) * limit)

        resolve({
          messages,
          totalPages,
          currentPage: page
        })
      } catch (error) {
        console.log(error)
        reject(error)
      }
    })
  }

  getLastMessage ({ userId, toUserId }) {
    return new Promise(async (resolve, reject) => {
      try {
        const message = await this.getMessages()
        resolve(message[message.length - 1])
      } catch (error) {
        reject(error)
      }
    })
  }

  insertMessages (data) {
    return new Promise(async (resolve, reject) => {
      try {
        const message = await new Message(data).save()
        resolve(message)
      } catch (error) {
        reject(error)
      }
    })
  }

  readMessage (messageId) {
    return new Promise(async (resolve, reject) => {
      try {
        const message = await Message.updateOne({ _id: mongoose.Types.ObjectId(messageId) }, { isRead: true })
        resolve(message)
      } catch (error) {
        reject(error)
      }
    })
  }
}

module.exports = new DbHandler()
