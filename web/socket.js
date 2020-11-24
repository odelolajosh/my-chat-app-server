
'use strict'

const { errorConstants } = require('../config/constants')
const dbHandler = require('../handler/db-handler')

class Socket {
  constructor (socket) {
    this.io = socket
  }

  socketEvents () {
    this.io.on('connection', (socket) => {
      console.log('connected')

      /**
       * Get the user chat list
       */
      socket.on('chat-list', async (data, callback) => {
        if (!data.userId || data.userId === '') { // If no userId
          const params = {
            error: true,
            message: errorConstants.USER_NOT_FOUND
          }
          return callback(params)
        }
        try {
          const [userInfoResponse, chatlistResponse] = await Promise.all([
            dbHandler.getUserInfo({ userId: data.userId }),
            dbHandler.getChatList(socket.id)
          ])
          this.io.to(socket.id).emit('chat-list-response', {
            error: false,
            singleUser: false,
            chatList: chatlistResponse
          })
          socket.broadcast.emit('chat-list-response', {
            error: false,
            singleUser: true,
            chatList: userInfoResponse
          })
        } catch (err) {
          const params = {
            error: true,
            message: errorConstants.USER_NOT_FOUND,
            chatlist: []
          }
          callback(params)
        }
      })

      /**
       * Get Last Message
       */
      socket.on('last-message', async (data, callback) => {
        try {
          const { fromUserId, toUserId } = data
          const [lastMessageResponse, userInfoResponse] = Promise.all(
            dbHandler.getLastMessage({ userId: fromUserId, toUserId: toUserId }),
            dbHandler.getUserInfo({ userId: fromUserId })
          )
          this.io.to(userInfoResponse.socketId).emit('last-message-response', lastMessageResponse)
        } catch (error) {
          const params = {
            error: true,
            message: errorConstants.SERVER_ERROR_MESSAGE
          }
          callback(params)
        }
      })

      /**
       * Read Message
       */
      socket.on('read-message', async (data, callback) => {
        try {
          const { messageId, fromUserId } = data
          const [readMessageResponse, userInfoResponse] = Promise.all(
            dbHandler.readMessage(messageId),
            dbHandler.getUserInfo({ userId: fromUserId })
          )
          this.io.to(userInfoResponse.socketId).emit('read-message-response', readMessageResponse)
        } catch (error) {
          const params = {
            error: true,
            message: errorConstants.SERVER_ERROR_MESSAGE
          }
          callback(params)
        }
      })

      /**
       * Type Message
       */
      socket.on('typing-message', async (data, callback) => {
        if (!data.toUserId) { // If not toUserId
          const params = {
            error: true,
            message: errorConstants.SERVER_ERROR_MESSAGE
          }
          return callback(params)
        }
        try {
          // Get the toUser socketId
          const userInfoResponse = await dbHandler.getUserInfo({ userId: data.toUserId })
          this.io.to(userInfoResponse.socketId).emit('typing-message-response', { userId: socket.request._query.userId })
        } catch (err) {
          const params = {
            error: true,
            message: errorConstants.SERVER_ERROR_MESSAGE
          }
          callback(params)
        }
      })

      /**
       * Send message
       */
      socket.on('add-message', async (data, callback) => {
        if (data.text.trim() === '') { // check if the message object contain a valid message
          const params = {
            error: true,
            message: errorConstants.EMPTY_MESSAGE_FOUND
          }
          return callback(params)
        }
        if (!data.fromUserId || !data.toUserId) { // check if message objects contains IDs
          const params = {
            error: true,
            message: errorConstants.USER_NOT_FOUND
          }
          return callback(params)
        }
        try {
          const [userInfoResponse, message] = await Promise.all([
            dbHandler.getUserInfo({ userId: data.toUserId }),
            dbHandler.insertMessages(data)
          ])
          this.io.to(userInfoResponse.socketId).emit('add-message-response', message)
        } catch (err) {
          const params = {
            error: true,
            message: errorConstants.SERVER_ERROR_MESSAGE
          }
          callback(params)
        }
      })

      /**
       * logout the user
       */
      socket.on('logout', async (data, callback) => {
        const userId = data.userId
        try {
          // logout
          await dbHandler.logoutUser(userId)
          this.io.to(socket.id).emit('logout-response', {
            error: false,
            message: errorConstants.USER_LOGGED_OUT,
            userId: userId
          })
          socket.broadcast.emit('chat-list-response', {
            error: false,
            userDisconnected: true,
            userId: userId
          })
        } catch (err) {
          const param = {
            error: true,
            message: errorConstants.SERVER_ERROR_MESSAGE,
            userId: userId
          }
          callback(param)
        }
      })

      /**
       * sending the disconnected user to all socket
       */
      socket.on('disconnect', async () => {
        console.log('disconnected')
        // const userId = socket.request._query['userId']
        const userId = socket.request._query.userId
        // logout
        await dbHandler.logoutUser(userId)
        socket.broadcast.emit('chat-list-response', {
          error: false,
          userDisconnected: true,
          userId: socket.request._query.userId
        })
      })
    })
  }

  socketConfig () {
    this.io.use(async (socket, next) => {
      try {
        await dbHandler.addSocketId({
          userId: socket.request._query.userId,
          socketId: socket.id
        })
        next()
      } catch (error) {
        console.log(error)
      }
    })

    this.socketEvents()
  }
}

module.exports = Socket
