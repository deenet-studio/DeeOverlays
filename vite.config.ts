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
  server: {
    host: '127.0.0.1',
    port: 5173,
    // OBS и редактор должны всегда обращаться к одному предсказуемому адресу.
    // Если порт занят, Vite сообщает об этом вместо незаметного перехода на 5174.
    strictPort: true,
  },
})
