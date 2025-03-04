"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"

export default function Chat() {
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messagesEndRef]) //Corrected dependency

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleMessageSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setError(null)
    setIsLoading(true)

    const userMessage = { role: "user", content: inputValue }
    const updatedMessages = [...chatMessages, userMessage]
    setChatMessages(updatedMessages)
    setInputValue("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setChatMessages([...updatedMessages, { role: "assistant", content: data.response }])
    } catch (err) {
      console.error("Error processing message:", err)
      setError("Det oppstod en feil ved behandling av meldingen. Vennligst prøv igjen.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">Senior Chat Assistent</h2>
        <div className="h-96 overflow-y-auto mb-4 p-4 border border-gray-300 rounded">
          {chatMessages.map((m, index) => (
            <div key={index} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <span
                className={`inline-block p-2 rounded-lg ${m.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              >
                {m.content}
              </span>
            </div>
          ))}
          {error && <div className="text-red-500 text-center mt-2">Feil: {error}</div>}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleMessageSubmit} className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Skriv et spørsmål..."
            className="flex-grow mr-2 p-2 border border-gray-300 rounded"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            disabled={isLoading}
          >
            {isLoading ? "Sender..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  )
}
