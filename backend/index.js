import express from 'express'
import logger from 'morgan'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'
import cors from 'cors'
import dotenv from 'dotenv'

const app = express()

dotenv.config() // Cargar las variables de entorno

app.use(cors({ origin: '*'}))

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
    },
    connectionStateRecovery: {}
})
    
const db = createClient({
    url: "libsql://true-doctor-octopus-martl7.turso.io",
    authToken: process.env.DB_TOKEN
})

// Crear la tabla de mensajes
await db.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT)
`)

io.on('connection', async (socket) =>  {
    console.log('A user connected')

    socket.on('disconnect', () => {
        console.log('A user disconnected')
    })

    socket.on('chat message', async (msg) => {
        let result
        try {
            result = await db.execute({
                sql: 'INSERT INTO messages (content) VALUES (:content)',
                args: { content: msg }
            })
        } catch (error) {
            console.error(error)
            return
        }

        io.emit('chat message', msg, result.lastInsertRowid.toString()) // Emitir el mensaje a todos los clientes
    })

    if (!socket.recovered) { // recuperarse los mensajes sin conexión
        try {
            const result = await db.execute({
                sql: 'SELECT id, content FROM messages WHERE id > ?',
                args: [socket.handshake.auth.serverOffset ?? 0]
            })
            
            result.rows.forEach(row => {
                socket.emit('chat message', row.content, row.id.toString())
            })
            
        } catch (error) {
            console.error(error)
        }

    }
})

app.use(logger('dev')) // Loggear las peticiones a nivel desarrollo

const port = process.env.PORT ?? 3000
/* 
app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html') // Servir el html
}) */

server.listen(port, () => console.log(`Server is running on port ${port}`))
