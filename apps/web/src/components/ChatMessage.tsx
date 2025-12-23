import './ChatMessage.css'

interface Message {
  id: string
  content: string
  role: "user" | "assistant";
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
    <div className={`message ${message.role}-message`}>
      <div className="message-content">
        { message.content}
      </div>
      <span className="message-time">{formatTime(message.timestamp)}</span>
    </div>
  )
}

export default ChatMessage
