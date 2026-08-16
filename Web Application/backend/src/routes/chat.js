import { Router } from 'express'
import { chat } from '../services/chat.js'

const router = Router()

router.post('/', async (request, response) => {
  response.json(await chat(
    request.body.messages,
    request.body.viewContext,
  ))
})

export default router
