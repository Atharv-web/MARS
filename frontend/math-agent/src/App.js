import React, {useState, useEffect, useRef} from 'react'
import './App.css'

export default function App(){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sessionId, setSessionId] = useState(null) 
  const [polling, setPolling] = useState(null)
  const [feedbackPrompt, setFeedbackPrompt] = useState(null)
  const pollingRef = useRef(null)
  const chatEndRef = useRef(null)

  function addMessage(author, content){
    setMessages(m=>[...m, {author,content}])
  }

  async function sendQuery() {
    if(!text.trim()) return
    addMessage ('user', text)
    // start the backend sesssion
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({input: text})
    })

    const data = await res.json()
    setSessionId(data.sessionId)
    addMessage('bot','Math Agent is processing....')
    setText('')
    
    if(!polling){
      setPolling(true)
    }
  }

  async function sendFeedback(msg) {
    if(!sessionId) return
    await fetch('http://localhost:8000/feedback',{
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({session_id: sessionId, feedback: msg})
    })
    setFeedbackPrompt(null)
    addMessage('user', msg)
  }

  // polling crewai session 
  useEffect(() =>{
    if(!polling) return
    pollingRef.current = setInterval(async() => {
      if(!sessionId) return
      const r = await fetch(`http://localhost:8000/session/${sessionId}`)
      const s = await r.json()

      if (s.prompt && s.status === 'running'){
        addMessage("bot",`what do u think?(feedback): \n${s.prompt}`)
        setFeedbackPrompt(s.prompt)
      }
      if (s.status === 'completed'){
        addMessage("bot",`Final Output:\n${s.output || 'no output captured..'}`)
        clearInterval(pollingRef.current)
        setPolling(false)
        setSessionId(null)
        setFeedbackPrompt(null)
      }
      if (s.status=== 'failed'){
        addMessage("bot",`Math agent failed: ${s.error}`)
        clearInterval(pollingRef.current)
        setPolling(false)
        setSessionId(null)
        setFeedbackPrompt(null)
      }
    }, 1500)
    return ()=> clearInterval(pollingRef.current)
  }, [polling, sessionId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className='app'>
      <div className='chat'>
        {messages.map((m,i)=> (
          <div key={i} className={`bubble ${m.author}`}>
            <pre style={{whiteSpace: 'pre-wrap'}}>{m.content}</pre>
          </div>
        ))}
        <div ref={chatEndRef}/>
      </div>

      {feedbackPrompt && (
        <div className="feedback">
          <button
            onClick={() => {
              const fb = prompt(feedbackPrompt)
              if (fb) sendFeedback(fb)
            }}
          >
            Send Feedback
          </button>
        </div>
      )}

      <div className="controls">
        
        <input value={text} onChange={e=>setText(e.target.value)} placeholder='Ask Math Agent'/>
        <button onClick={sendQuery}>Send</button>
      </div>

    </div>
  )

}
