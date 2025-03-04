"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      console.log("Sending request to API")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      const responseText = await response.text()
      console.log("API response:", responseText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        throw new Error("Invalid JSON response from server")
      }

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.reply || !data.reply.content) {
        throw new Error("Invalid response format from server")
      }

      const assistantMessage: Message = { role: "assistant", content: data.reply.content }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setError(error instanceof Error ? error.message : String(error))

      // Add fallback message if there's an error
      const fallbackMessage: Message = {
        role: "assistant",
        content: "Beklager, jeg har problemer med å svare akkurat nå. Kan du prøve igjen senere?",
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OpenAI Chatbot</h1>
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        {error && <div className="text-red-500 mt-2">Feil: {error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-l p-2"
          placeholder="Skriv en melding..."
          disabled={isLoading}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r" disabled={isLoading}>
          {isLoading ? "Sender..." : "Send"}
        </button>
      </form>
    </div>
  )
}

