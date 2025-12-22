import './ChatMessage.css'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
}

function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`message ${message.sender}-message`}>
      <div className="message-content">
        {message.text}
      </div>
      <span className="message-time">{formatTime(message.timestamp)}</span>
    </div>
  )
}

export default ChatMessage
