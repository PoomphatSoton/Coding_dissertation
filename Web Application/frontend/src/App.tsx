import { useState } from 'react'
import { Button, Container, Row } from 'react-bootstrap'
import { sendChat } from './api'
import { ChatPanel } from './components/ChatPanel'
import { ProductPanel } from './components/ProductPanel'
import type { ChatMessage, ChatProduct, ChatViewContext } from './types'

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatProducts, setChatProducts] = useState<ChatProduct[] | null>(null)
  const [viewContext, setViewContext] = useState<ChatViewContext>({
    type: 'product_list',
    products: [],
  })
  const [chatOpen, setChatOpen] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function sendMessage(text: string) {
    if (sending) return

    const userMessage: ChatMessage = {
      id: (messages.at(-1)?.id ?? 0) + 1,
      role: 'user',
      text,
    }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setSending(true)
    setError(null)

    try {
      const response = await sendChat(nextMessages, viewContext)
      if (response.products !== null) setChatProducts(response.products)
      setMessages((current) => [
        ...current,
        {
          id: (current.at(-1)?.id ?? 0) + 1,
          role: 'assistant',
          text: response.message,
        },
      ])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <Container fluid className="p-0">
      <Row className="g-0 app-layout">
        <div className={`app-products ${chatOpen ? '' : 'app-products-full'}`}>
          <ProductPanel
            chatProducts={chatProducts}
            onShowAll={() => setChatProducts(null)}
            onViewContextChange={setViewContext}
          />
        </div>
        {chatOpen && (
          <div className="app-chat">
            <ChatPanel
              messages={messages}
              onSend={sendMessage}
              onClose={() => setChatOpen(false)}
              isSending={sending}
              error={error}
            />
          </div>
        )}
      </Row>
      {!chatOpen && (
        <Button
          className="position-fixed end-0 bottom-0 m-3 z-3"
          variant="dark"
          onClick={() => setChatOpen(true)}
        >
          Open chat
        </Button>
      )}
    </Container>
  )
}
