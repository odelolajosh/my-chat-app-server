const http = require('http')
const socketIo = require('socket.io')
const app = require('./app')
const AppConfig = require('./config/app-config')
const db = require('./config/db')
const Routes = require('./web/routes')
const Socket = require('./web/socket')

class Server {
  constructor (app) {
    this.app = app
    this.server = http.createServer(app)
    this.io = socketIo(this.server)
  }

  appConfig () {
    new AppConfig(this.app).includeConfig()
  }

  /* Including app Routes starts */
  includeRoutes () {
    new Routes(this.app).routesConfig() // for the routing
    new Socket(this.io).socketConfig()
  }

  async appExecute () {
    this.appConfig()
    try {
      await db.onConnect()
      this.includeRoutes()
    } catch (err) {
      console.log(err)
    }

    const port = process.env.PORT || 4001
    const host = process.env.HOST || 'localhost'

    // this.server.listen(port, host, () => console.log(`listening on http://${host}:${port}`))
    this.server.listen(port);
  }
}

const server = new Server(app)
server.appExecute()
