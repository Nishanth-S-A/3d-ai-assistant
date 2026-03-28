import React, { useState } from 'react'
import { Send } from 'lucide-react'

export default function ChatBox({ onSend, messages, loading, assistantName }) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() !== '' && !loading) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <div className="chat-container">
      <div className="messages" id="chat-messages">
        {messages.length === 0 && (
          <div className="msg assistant welcome-msg">
            Greetings! I am {assistantName}. How can I help you today?
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>{m.content}</div>
        ))}
        {loading && <div className="msg assistant thinking-dots">Thinking</div>}
      </div>
      <div className="input-row">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={loading ? 'The old master is pondering...' : 'Type your message...'} 
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}