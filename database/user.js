const User = require('../model/user')
const uuid = require('uuid')

const db = []
const bcrypt = require('bcrypt')

exports.getAllUser = () => (
  new Promise((resolve, reject) => resolve(db))
)

exports.getOneUser = (id) => (
  new Promise((resolve) => {
    const user = db.find((user) => user.id === id)
    resolve(user)
  })
)

exports.addSocketId = ({ userId, socketId }) => (
  new Promise((resolve, reject) => {
    console.log('hello ' + userId, db || null)
    const index = db.findIndex((user) => user.id === userId)
    db[index].online = 'Y'
    db[index].socketId = socketId
  })
)

exports.getUserInfo = ({ userId }) => (
  new Promise((resolve, reject) => {
    const user = db.find((user) => user.id === userId)
    resolve({
      socketId: user.socketId,
      online: user.online
    })
  })
)

exports.getChatList = (userId) => (
  new Promise((resolve, reject) => {
    try {
      const user = db.find((user) => user.id === userId)
      resolve(user.chatList)
    } catch (err) {
      reject(err)
    }
  })
)

exports.logoutUser = (userId) => (
  new Promise((resolve, reject) => {
    const index = db.findIndex((user) => user.id === userId)
    db[index].online = 'N'
  })
)

exports.createUser = (username, email, password) => (
  new Promise((resolve, reject) => {
    if (db.findIndex(user => user.username === username) !== -1) {
      return reject(new Error('User not found'))
    }
    bcrypt.hash(password, 10)
      .then(hash => new User({ id: uuid.v4(), username, email, password: hash }))
      .then(user => {
        db.push(user)
        resolve({ id: db[db.length - 1].id })
      })
      .catch(err => reject(err))
  })
)

exports.loginUser = (username, password) => (
  new Promise((resolve, reject) => {
    const user = db.find((user) => user.username === username)
    if (!user) {
      reject(new Error(`user ${username} not found`))
    }
    bcrypt.compare(password, user.password).then((valid) => {
      if (!valid) {
        throw new Error('You entered the wrong password')
      }
      resolve({ id: user.id })
    }).catch(err => reject(err))
  })
)
