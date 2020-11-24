const { BASE_URL } = require('../config/constants')
const userRoute = require('../routes/user')
const messageRoute = require('../routes/message')


class Routes {
  constructor (app) {
    this.app = app
  }

  routesConfig () {
    this.app.use(`${BASE_URL}/user`, userRoute)
    this.app.use(`${BASE_URL}/message`, messageRoute)
  }
}

module.exports = Routes
