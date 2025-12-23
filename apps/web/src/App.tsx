import { useState, useRef, useEffect } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import { useChatStream } from "./hooks/useChatStream";
import './App.css'

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot'
    timestamp: Date
}

function App() {
    // let [messages, setMessages] = useState<Message[]>([
    //     {
    //         id: '1',
    //         text: 'Hello! 👋 I\'m your AI assistant. How can I help you today?',
    //         sender: 'bot',
    //         timestamp: new Date(),
    //     },
    // ])

  const { messages, sendMessage, isStreaming, stopStreaming } = useChatStream();

    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])
/*
    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date(),
        }

       // setMessages((prev) => [...prev, userMessage])
        setIsLoading(true)

        try {

            //health check example
            //  const response = await fetch('/health', {
            // method: 'GET',
            // headers: {
            //   'Content-Type': 'application/json',
            // },

            // Call the API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify({
                    "messages": [
                        { "role": "user", "content": text }
                    ]
                }),

            })


            if (!response.ok) {
                throw new Error('Failed to get response from server')
            }

            // Add bot response
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || 'Sorry, I couldn\'t process that.',
                sender: 'bot',
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, botMessage])
        } catch (error) {
            console.error('Error sending message:', error)

            // Add error message
            const errorMessage: Message = {
                id: (Date.now() + 2).toString(),
                text: 'Sorry, something went wrong. Please try again.',
                sender: 'bot',
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }
*/
    return (
        <div className="app">
            <div className="chat-container">
                <div className="chat-header">
                    <h1>GenAI Copilot</h1>
                    <p>Your intelligent assistant</p>
                </div>

                <div className="chat-messages">
                    {messages.map((message) => (
                       console.log(message),
                       <ChatMessage key={message.id} message={message} />
                    ))}
                          {isLoading && (
                        <div className="message bot-message">
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <ChatInput onSendMessage={sendMessage}  isStreaming={isStreaming} stopStreaming={stopStreaming} />
                
            {isStreaming && (
                <button onClick={stopStreaming} style={{ marginLeft: 8 }}>
                Stop
                </button>
            )}
            </div>
        </div>
    )
}

export default App


