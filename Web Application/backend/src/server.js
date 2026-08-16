import express from 'express'
import { prisma } from './db.js'
import chatRoutes from './routes/chat.js'
import productRoutes from './routes/products.js'

const app = express()
const port = Number(process.env.PORT) || 3005

app.use(express.json())
app.get('/api/health', (_request, response) => response.json({ status: 'ok' }))
app.use('/api/products', productRoutes)
app.use('/api/chat', chatRoutes)

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: 'Internal server error' })
})

const server = app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`)
})

async function shutdown() {
  server.close()
  await prisma.$disconnect()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
