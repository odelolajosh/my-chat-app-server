const db = require('../database/user')
const dbHandler = require('../handler/db-handler')
const jwt = require('jsonwebtoken')

exports.getAllUsers = async (req, res, next) => {
  const users = await db.getAllUser()
  res.status(400).json({ status: 'success', users: users })
}

exports.getUserById = async (req, res, next) => {
  const id = req.params.id // Get Id from req
  const user = await dbHandler.getUserById(id)
  res.status(400).json({ status: 'success', user: user })
}

exports.createUser = async (req, res, next) => {
  const { username, email, password } = req.body
  try {
    const { userId } = await dbHandler.createUser(username, email, password)
    console.log(userId)
    const token = jwt.sign(
      { userId: userId },
      process.env.TOKEN_ENCRYPT_KEY,
      { expiresIn: '24h' }
    )
    return res.status(201).json({ status: 'success', userId: userId, token })
  } catch (e) {
    return res.status(404).json({ status: 'error', error: e || 'Could not create user' })
  }
}

exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body || {}
  try {
    const { userId } = await dbHandler.loginUser(username, password)
    const token = jwt.sign(
      { userId: userId },
      process.env.TOKEN_ENCRYPT_KEY,
      { expiresIn: '24h' }
    )
    return res.status(201).json({ status: 'success', userId: userId, token })
  } catch (e) {
    return res.status(404).json({ status: 'error', error: e || 'Could not login' })
  }
}

exports.refreshToken = async (req, res) => {
  const id = req.params.id
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.TOKEN_ENCRYPT_KEY)
    const userId = decodedToken.userId
    if (id !== userId) {
      throw new Error('Invalid user ID')
    } else {
      await dbHandler.getUserInfo({ userId })
      return res.status(201).json({ status: 'success', userId: id, token })
    }
  } catch (error) {
    res.status(401).json({ error })
  }
}
