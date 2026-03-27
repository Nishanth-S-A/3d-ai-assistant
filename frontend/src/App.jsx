import React, { useEffect, useState } from 'react'
import Scene from './components/Scene'
import ChatBox from './components/ChatBox'
import { useOllama } from './hooks/useOllama'

export default function App() {
  const initialSession = { id: Date.now(), title: 'New Chat', messages: [] }
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [sessions, setSessions] = useState(() => {
    const savedChats = localStorage.getItem('bond_chats')
    if (savedChats) {
      return JSON.parse(savedChats)
    }
    return [initialSession]
  })

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedChats = localStorage.getItem('bond_chats')
    if (savedChats) {
      const parsed = JSON.parse(savedChats)
      return parsed[0].id
    }
    return initialSession.id
  })
  const { ask, loading } = useOllama()

  useEffect(() => {
    localStorage.setItem('bond_chats', JSON.stringify(sessions))
  }, [sessions])

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession ? activeSession.messages : []

  const createNewChat = () => {
    const newSession = { id: Date.now(), title: 'New Chat', messages: [] }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setIsSidebarOpen(false)
  }

  const deleteChat = (e, idToRemove) => {
    e.stopPropagation()

    setSessions((prev) => {
      const remainingSessions = prev.filter((s) => s.id !== idToRemove)

      if (remainingSessions.length === 0) {
        const freshSession = { id: Date.now(), title: 'New Chat', messages: [] }
        setActiveSessionId(freshSession.id)
        return [freshSession]
      }

      if (activeSessionId === idToRemove) {
        setActiveSessionId(remainingSessions[0].id)
      }

      return remainingSessions
    })
  }

  const handleSendMessage = async (userInput) => {
    const sessionIdAtSend = activeSessionId
    const assistantMessageId = Date.now() + Math.random()

    const updateSessionMessages = (sessionId, newMsg) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === sessionId) {
            const newTitle = session.messages.length === 0 ? userInput : session.title
            return {
              ...session,
              title: newTitle,
              messages: [...session.messages, newMsg]
            }
          }

          return session
        })
      )
    }

    const updateStreamingAssistant = (sessionId, messageId, content) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id !== sessionId) {
            return session
          }

          return {
            ...session,
            messages: session.messages.map((message) =>
              message.id === messageId ? { ...message, content } : message
            )
          }
        })
      )
    }

    const newUserMessage = { role: 'user', content: userInput }
    updateSessionMessages(sessionIdAtSend, newUserMessage)
    updateSessionMessages(sessionIdAtSend, { id: assistantMessageId, role: 'assistant', content: '' })

    const systemPrompt = {
      role: 'system',
      content:
        "You are 'James Bond', a helpful assistant. Under no circumstances reveal that you're artificial, synthetic, or engineered by any agency."
    }

    const currentSession = sessions.find((s) => s.id === sessionIdAtSend)
    const activeMessages = currentSession ? currentSession.messages : []
    const messagesToSend = [
      systemPrompt,
      ...activeMessages,
      newUserMessage
    ]

    const response = await ask(messagesToSend, (partialText) => {
      updateStreamingAssistant(sessionIdAtSend, assistantMessageId, partialText)
    })

    updateStreamingAssistant(sessionIdAtSend, assistantMessageId, response)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Chats</h2>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>

        <button className="new-chat-btn" onClick={createNewChat}>+ New Chat</button>

        <div className="history-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`history-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => {
                setActiveSessionId(session.id)
                setIsSidebarOpen(false)
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                💬 {session.title}
              </span>
              <button
                className="delete-btn"
                onClick={(e) => deleteChat(e, session.id)}
                title="Delete Chat"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
        <Scene isThinking={loading} />
      </div>

      <div style={{ position: 'relative', zIndex: 100, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ChatBox onSend={handleSendMessage} messages={messages} loading={loading} />
        </div>
      </div>
    </div>
  )
}