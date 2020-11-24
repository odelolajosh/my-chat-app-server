const messages = []

exports.getMesagesFromAndTo = ({ fromUserId, toUserId }) => (
  new Promise((resolve, reject) => {
    try {
      const newMessages = messages.filter((messages) => (
        (messages.fromUserId === fromUserId && messages.toUserId === toUserId) ||
        (messages.fromUserId === toUserId && messages.toUserId === fromUserId)
      ))
      resolve(newMessages)
    } catch (err) {
      reject(err)
    }
  })
)

exports.insertMessage = (message) => (
  new Promise((resolve, reject) => {
    try {
      messages.push(message)
      resolve(message)
    } catch (err) {
      reject(err)
    }
  })
)
