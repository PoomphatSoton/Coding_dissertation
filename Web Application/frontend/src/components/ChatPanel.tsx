import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Alert, Button, Card, Form, InputGroup, Spinner } from 'react-bootstrap'
import type { ChatMessage } from '../types'

interface ChatPanelProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
  onClose: () => void
  isSending: boolean
  error: string | null
}

export function ChatPanel({ messages, onSend, onClose, isSending, error }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending, error])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = message.trim()
    if (!text || isSending) return
    onSend(text)
    setMessage('')
  }

  return (
    <Card className="vh-100 rounded-0 border-0 border-start bg-light">
      <Card.Header className="d-flex align-items-center gap-2 bg-white p-3">
        <h2 className="h5 mb-0">Chat</h2>
        <small className="text-secondary">Shopping assistant</small>
        <Button
          className="ms-auto"
          variant="outline-secondary"
          size="sm"
          onClick={onClose}
          aria-label="Close chat"
        >
          Close
        </Button>
      </Card.Header>

      <Card.Body className="chat-messages p-3" aria-live="polite">
        {messages.length === 0 ? (
          <div className="m-auto text-center text-secondary">
            <h3 className="h6 text-dark">Start a conversation</h3>
            <p className="small mb-0">Ask about any product in the catalogue.</p>
          </div>
        ) : (
          messages.map(({ id, role, text }) => {
            const isUser = role === 'user'
            return (
              <div className={`d-flex ${isUser ? 'justify-content-end' : ''}`} key={id}>
                <p
                  className={`message-bubble rounded-3 px-3 py-2 ${
                    isUser ? 'bg-dark text-white' : 'bg-white border'
                  }`}
                >
                  {text}
                </p>
              </div>
            )
          })
        )}

        {isSending && (
          <div className="d-flex align-items-center gap-2 small text-secondary" role="status">
            <Spinner animation="border" size="sm" aria-hidden="true" />
            Thinking...
          </div>
        )}
        {error && <Alert variant="danger" className="small mb-0">{error}</Alert>}
        <div ref={endRef} />
      </Card.Body>

      <Card.Footer className="bg-white p-3">
        <Form onSubmit={submit}>
          <InputGroup>
            <Form.Control
              aria-label="Message the shopping assistant"
              placeholder="Ask about a product..."
              value={message}
              disabled={isSending}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button variant="dark" type="submit" disabled={isSending || !message.trim()}>
              Send
            </Button>
          </InputGroup>
        </Form>
      </Card.Footer>
    </Card>
  )
}
