import React, { useState } from 'react'

export default function ChatBox({ onSend, messages, loading }) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() !== '') {
      onSend(input)
      setInput('')
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>{m.content}</div>
        ))}
        {loading && <div className="msg assistant">...thinking</div>}
      </div>
      <div className="input-row">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type here..." 
        />
        <button onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  )
}