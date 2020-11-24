const bodyParser = require('body-parser')
const ExpressConfig = require('./express-config')
const cors = require('cors')
const dotenv = require('dotenv')

class AppConfig {
  constructor (app) {
    // configure dotenv
    dotenv.config()
    this.app = app
  }

  includeConfig () {
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      next()
    })
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(cors())
    new ExpressConfig(this.app)
  }
}

module.exports = AppConfig
