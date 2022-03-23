
const WebSocketServer = require('ws').Server

let sockets = {}
let socketsCount = 0

const wss = new WebSocketServer({port: 9001})

const transmit = (socket, data) => {
  const payload = JSON.stringify(data)
  socket.send(payload)
}

const broadcast = (socket, data) => {
  if (socketsCount < 2) return
  for (otherSocket in sockets) {
    if (otherSocket.name == socket.name) continue
    transmit(otherSocket, data)
  }
}

wss.on('connection', (socket) => {
  socket.on('message', (payload) => {
    let data

    /*
    login_example = {
      'type':'login',
      'id':'2342344234-342432342342'
    }
    */

    try {
      data = JSON.parse(payload)
    } catch (error) {
      return
    }

    if (data.type == "connect") {
      if (data.id in sockets) {
        transmit(socket, {type:'connect', success:false})
        return
      }
      sockets[data.id] = socket
      socket.name = data.id
      socketsCount++
      transmit(socket, {type:'connect', success:true})
    }

    if (data.type == "disconnect") {
      if (socket.name !== undefined) {
        delete sockets[socket.name]
        socketsCount--
      }
      return
    }

    if (data.type == "offer" && socket.name !== undefined) {
      broadcast(socket, {type:'offer', offer:data.offer, name:socket.name})
      return
    }

    if (data.type == "answer" && socket.name !== undefined) {
      const otherSocket = sockets[data.name]
      if (otherSocket == null) return
      transmit(otherSocket, {type:'answer', answer:data.answer})
      return
    }

    if (data.type == "candidate") {
      const otherSocket = sockets[data.name]
      if (otherSocket == null) return
      transmit(otherSocket, {type:'candidate', candidate:data.candidate})
      return
    }
  })
})