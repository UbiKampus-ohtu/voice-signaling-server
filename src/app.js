module.exports = (port = 9001) => {
  const express = require('express')
  const app = express()
  const http = require('http')
  const cors = require('cors')

  app.use(cors())
  app.use('/', express.static('./static/'))

  const server = http.createServer(app)
  const websocketServer = require('./websocket_server')(server)

  server.listen(port, () => {
    console.log(`server started at port ${port}`)
  })
}