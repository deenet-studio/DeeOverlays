import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { WebSocketServer, WebSocket } from 'ws'

function localOverlaySync() {
  let latestMessage = ''
  const socketServer = new WebSocketServer({ noServer: true })

  socketServer.on('connection', socket => {
    if (latestMessage) socket.send(latestMessage)
    socket.on('message', data => {
      latestMessage = data.toString()
      for (const client of socketServer.clients) if (client.readyState === WebSocket.OPEN) client.send(latestMessage)
    })
  })

  return {
    name: 'deeoverlays-local-sync',
    configureServer(server: { httpServer: import('node:http').Server | null }) {
      server.httpServer?.on('upgrade', (request, socket, head) => {
        if (request.url !== '/deeoverlays-sync') return
        socketServer.handleUpgrade(request, socket, head, client => socketServer.emit('connection', client, request))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localOverlaySync()],
})
