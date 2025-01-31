import { useState } from 'react'
import './App.css'
import Chatbox from './components/chatbot/ChatBot'


function App() {

  const [ signedIn, setSignedIn ] = useState(false)

  return (
    <div>
      <Chatbox onSignIn={signedIn}/>
    </div>
  )
}

export default App
