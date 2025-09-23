import React, {useState, useEffect, useRef} from 'react'
import './App.css'

export default function App(){
  const [messages, setMessages] = useState([])
  const [humanInputRequired, setHumanInputRequired] = useState(false);
  const [inputPrompt, setInputPrompt] = useState('');

  function addMessage(author, content){
    setMessages(m=>[...m, {author,content}])
  }

  async function sendQuery(){
    if(!text.trim()) return
    addMessage ('user', text)
    // start the backend sesssion
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({input: text})
    })

    if (res.status===202){
      setHumanInputRequired(true)
      setInputPrompt(res.data.prompt)
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
