const dbHandler = require('../handler/db-handler')
const jwt = require('jsonwebtoken')

exports.getAllUsers = async (req, res, next) => {
  const users = await dbHandler.getAllUsers()
  res.status(400).json({ status: 'success', users })
}

exports.getUserById = async (req, res, next) => {
  const id = req.params.id // Get Id from req
  const user = await dbHandler.getUserById(id)
  res.status(400).json({ status: 'success', user: user })
}

exports.createUser = async (req, res, next) => {
  const { username: name, email, password } = req.body
  try {
    const { userId, imageUrl, username } = await dbHandler.createUser(name, email, password)
    console.log(userId)
    const token = jwt.sign(
      { userId: userId },
      process.env.TOKEN_ENCRYPT_KEY,
      { expiresIn: '24h' }
    )
    return res.status(201).json({ status: 'success', userId: userId, token, imageUrl, username })
  } catch (e) {
    return res.status(404).json({ status: 'error', error: e || 'Could not create user' })
  }
}

exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body || {}
  try {
    const { userId, imageUrl } = await dbHandler.loginUser(username, password)
    const token = jwt.sign(
      { userId: userId },
      process.env.TOKEN_ENCRYPT_KEY,
      { expiresIn: '24h' }
    )
    return res.status(201).json({ status: 'success', userId: userId, token, imageUrl, username })
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
      const { username, imageUrl, _id } = await dbHandler.getUserInfo({ userId })
      return res.status(201).json({ status: 'success', userId: _id, token, username, imageUrl })
    }
  } catch (error) {
    res.status(401).json({ error })
  }
}
