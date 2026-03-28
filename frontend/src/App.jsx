import React, { useEffect, useState, useRef } from 'react'
import Scene from './components/Scene'
import ChatBox from './components/ChatBox'
import { useOllama } from './hooks/useOllama'

export default function App() {
  const [sessions, setSessions] = useState(() => {
    const savedChats = localStorage.getItem('bond_chats')
    if (savedChats) {
      const parsed = JSON.parse(savedChats)
      return parsed.length > 0 ? parsed : [{ id: Date.now(), title: 'New Chat', messages: [] }]
    }
    return [{ id: Date.now(), title: 'New Chat', messages: [] }]
  })

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0].id
  })
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { ask, loading } = useOllama()

  const [currentAction, setCurrentAction] = useState('idle')
  const lastInteractionRef = useRef(Date.now())

  const assistantName = import.meta.env.VITE_ASSISTANT_NAME || 'Master Roshi'

  useEffect(() => {
    localStorage.setItem('bond_chats', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    const idleInterval = setInterval(() => {
      // Occasional clapping when bored (15 seconds of inactivity)
      if (Date.now() - lastInteractionRef.current > 15000 && currentAction === 'idle' && !loading) {
        setCurrentAction('clapping')
        setTimeout(() => {
          setCurrentAction('idle')
          lastInteractionRef.current = Date.now() // Reset after clapping
        }, 2500)
      }
    }, 1000)
    return () => clearInterval(idleInterval)
  }, [currentAction, loading])

  const activeSession = sessions.find((s) => s.id === activeSessionId)
  const messages = activeSession ? activeSession.messages : []

  const createNewChat = () => {
    lastInteractionRef.current = Date.now()
    const newSession = { id: Date.now(), title: 'New Chat', messages: [] }
    setSessions((prev) => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setIsSidebarOpen(false)

    setCurrentAction('stand')
    setTimeout(() => {
      setCurrentAction('entry')
      setTimeout(() => {
        setCurrentAction('idle')
      }, 2500)
    }, 1500)
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
    lastInteractionRef.current = Date.now()

    const lowerInput = userInput.toLowerCase()
    let actionToPlay = 'talking'
    
    if (/(hi|hello|hey|bye|greetings)/.test(lowerInput)) {
      actionToPlay = 'waving'
    } else if (/(motivat|cheer|inspire|encourage|you got this)/.test(lowerInput)) {
      actionToPlay = 'cheering'
    } else if (/(correct|good job|nice|well done|awesome|excellent)/.test(lowerInput)) {
      actionToPlay = 'clapping'
    }

    setCurrentAction(actionToPlay)
    
    // If not naturally talking, revert to talking after the special animation finishes
    if (actionToPlay !== 'talking') {
      setTimeout(() => {
        setCurrentAction('talking')
      }, 2500)
    }

    const sessionIdAtSend = activeSessionId
    const assistantMessageId = crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random()

    const updateSessionMessages = (sessionId, newMsg) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === sessionId) {
            const hasNoUserMessages = session.messages.filter(m => m.role === 'user').length === 0
            const newTitle = (hasNoUserMessages && session.title === 'New Chat') ? userInput : session.title
            return {
              ...session,
              title: newTitle,
              messages: [...session.messages, { ...newMsg, id: newMsg.id || (crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random()) }]
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

    const systemPromptContent = assistantName === 'Master Roshi' 
      ? `Role: You are Master Roshi (Kame-Sennin), the legendary Turtle Hermit and creator of the Kamehameha.

Personality Profile:

The Wise Mentor: You have lived for centuries and seen it all. You offer profound, grounded advice on discipline, hard work, and the "Turtle School" philosophy: Work hard, study well, eat and sleep plenty, and play even more.

Cheerful & Jovial: You maintain a high-energy, upbeat attitude. You often laugh with a signature "Ho ho ho!" or "Heh heh!"

Humble yet Proud: You act like a goofy old man, but you are a master of ki. You refer to yourself as "the old master" or "this old hermit."

Helpful Peer: You treat the user like a promising new student. You are encouraging and patient, never condescending.

The "Dirty Old Man" (Filtered): While you retain your appreciation for "pretty ladies," keep it subtle, lighthearted, and PG-rated. Focus more on your love for naps, sunglasses, and tropical island life.

Communication Style:

Vocabulary: Use phrases like "Listen up, kid!", "By the beard of the Turtle!", and "Back in my day..."

Tone: Relaxed, witty, and occasionally repetitive (as an old man might be).

Formatting: Use bolding for emphasis on life lessons.

Core Directives:

Always be helpful. If the user asks for technical help, explain it as if you're teaching a new martial arts technique.

Stay in character. Even when explaining complex topics, use metaphors involving training, heavy turtle shells, or martial arts tournaments.

Keep it light. Use humor to deflect tension.

Example Interaction
User: "Can you help me stay motivated to finish this project?"

Master Roshi:
"Ho ho ho! Motivation, eh? Listen up, kid! Even Goku didn't learn the Kamehameha in a single afternoon—it took me fifty years to perfect it!

You've got to pace yourself. If you just stare at the mountain, you'll get tired before you even lace up your boots. Here is the Turtle School secret for you: Break that project into small chunks. Do a little bit of work, then take a nap! A rested mind is a sharp mind. Now, get to it, or I’ll make you deliver milk crates while wearing a forty-pound turtle shell! Heh heh!`
      : `Role: You are ${assistantName}. Be helpful and friendly.`

    const systemPrompt = {
      role: 'system',
      content: systemPromptContent
    }

    const currentSession = sessions.find((s) => s.id === sessionIdAtSend)
    const activeMessages = currentSession ? currentSession.messages : []
    // Filter out message IDs for the API
    const messagesToSend = [
      systemPrompt,
      ...activeMessages.map(({ role, content }) => ({ role, content })),
      newUserMessage
    ]

    const response = await ask(messagesToSend, (partialText) => {
      lastInteractionRef.current = Date.now()
      updateStreamingAssistant(sessionIdAtSend, assistantMessageId, partialText)
    })

    updateStreamingAssistant(sessionIdAtSend, assistantMessageId, response)
    setCurrentAction('idle')
    lastInteractionRef.current = Date.now()
  }

  useEffect(() => {
    const container = document.getElementById('chat-messages')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, loading])

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
        <Scene currentAction={currentAction} isThinking={loading} />
      </div>

      <div style={{ position: 'relative', zIndex: 100, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <ChatBox onSend={handleSendMessage} messages={messages} loading={loading} assistantName={assistantName} />
        </div>
      </div>
    </div>
  )
}