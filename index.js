
const WebSocketServer = require('ws').Server

let sockets = {}

const wss = new WebSocketServer({port: 9001})

wss.on('connection', (socket) => {
  socket.on('message', (payload) => {
    let data

    const login_example = {
      'type':'login',
      'id':'2342344234-342432342342'
    }

    try {
      data = JSON.parse(payload)
    } catch (error) {
      return
    }

    if (data.type == "connect") {
      if (data.id in sockets) {
        socket.send({'type':'connect','success':false})
        return
      }
      sockets[data.id] = socket
      socket.name = data.id
      socket.send({'type':'connect','success':true})
    }

    if (data.type == "disconnect") {
      if (socket.name !== undefined) {
        delete sockets[socket.name]
      }
      return
    }
  })
})