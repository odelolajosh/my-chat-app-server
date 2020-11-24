const dbHandler = require('../handler/db-handler')

exports.getAllMessagesByUsers = async (req, res, next) => {
  const { userId, toUserId } = req.body
  const { page, limit } = req.query
  if (!userId || userId === '') {
    return res.status(401).json({
      status: 'error',
      message: 'User ID not found'
    })
  }

  try {
    const messages = await dbHandler.getMessages({ userId, toUserId }, { page, limit })
    return res.status(200).json({
      status: 'success',
      ...messages
    })
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      error,
      message: 'Could not fetch messages'
    })
  }
}
