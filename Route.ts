import { NextResponse } from "next/server"
import OpenAI from "openai"

// Fallback responses in case OpenAI API fails
const fallbackResponses = [
  "Beklager, jeg har problemer med å svare akkurat nå. Kan du prøve igjen senere?",
  "Det oppstod en feil. Kan du omformulere spørsmålet ditt?",
  "Jeg har tekniske problemer. Vennligst prøv igjen om litt.",
]

let openai: OpenAI

try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
} catch (error) {
  console.error("Error initializing OpenAI client:", error)
}

export async function POST(req: Request) {
  console.log("API route called: /api/chat")
  try {
    // Parse request body
    const body = await req.json()
    console.log("Request body:", body)

    const { messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages format")
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Format messages for OpenAI API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    formattedMessages.unshift({
      role: "system",
      content: `Du er en hjelpsom assistent.`,
    })

    // Check if OpenAI client is initialized
    if (!openai) {
      console.error("OpenAI client is not initialized")
      throw new Error("OpenAI client is not initialized")
    }

    // Call OpenAI API
    console.log("Calling OpenAI API")
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: formattedMessages,
        max_tokens: 150,
        temperature: 0.7,
      })
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      // Use fallback response if OpenAI API fails
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      return NextResponse.json({ reply: { role: "assistant", content: fallbackResponse } })
    }

    console.log("OpenAI API response received")
    const reply = completion.choices[0].message

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Error in API route:", error)
    return NextResponse.json(
      {
        error: "Det oppstod en feil ved behandling av forespørselen",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

