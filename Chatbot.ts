import { NextResponse } from "next/server"
import OpenAI from "openai"

// Simple rule-based fallback responses
const fallbackResponses: Record<string, string> = {
  hei: "Hei! Hvordan kan jeg hjelpe deg i dag?",
  "hvordan går det": "Det går bra, takk! Hvordan kan jeg assistere deg?",
  "hva er klokken": "Jeg kan dessverre ikke gi deg nøyaktig tid, men du kan se på klokken på enheten din.",
  takk: "Bare hyggelig! Er det noe annet jeg kan hjelpe deg med?",
  nei: "Ok! Ha en fin dag videre. Si ifra hvis du trenger hjelp senere.",
  ja: "Flott! Hva kan jeg hjelpe deg med?",
  hjelp:
    "Jeg er her for å hjelpe deg. Du kan spørre meg om forskjellige temaer, og jeg vil gjøre mitt beste for å svare.",
}

// Function to get a fallback response
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim()

  // Check for exact matches
  if (fallbackResponses[lowerMessage]) {
    return fallbackResponses[lowerMessage]
  }

  // Check for partial matches
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lowerMessage.includes(key)) {
      return response
    }
  }

  // Default response
  return "Jeg beklager, men jeg forstår ikke helt. Kan du omformulere spørsmålet ditt?"
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    "*************************************************************************************************************************",
})

export async function POST(req: Request) {
  try {
    console.log("API route called: /api/chatbot")

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Kunne ikke tolke forespørselen" }, { status: 400 })
    }

    const { messages } = body

    if (!messages || messages.length === 0) {
      console.error("No messages received")
      return NextResponse.json({ error: "Ingen meldinger mottatt" }, { status: 400 })
    }

    const userMessage = messages[messages.length - 1].content
    console.log("User message:", userMessage)

    // Get fallback response in case OpenAI fails
    const fallbackResponse = getFallbackResponse(userMessage)

    try {
      console.log("Attempting to use OpenAI API")

      // Format messages for OpenAI API
      const formattedMessages = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add system message
      formattedMessages.unshift({
        role: "system",
        content: `Du er en hjelpsom assistent.`,
      })

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: formattedMessages,
        max_tokens: 200,
        temperature: 0.7,
      })

      const assistantResponse = completion.choices[0].message.content
      console.log("Received response from OpenAI")

      // Set appropriate headers
      return NextResponse.json(
        { response: assistantResponse, success: true },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)

      // Return the fallback response if OpenAI fails
      console.log("Using fallback response system")
      return NextResponse.json(
        { response: fallbackResponse, fallback: true },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }
  } catch (error) {
    console.error("Error in chatbot API:", error)

    // Always return a JSON response, even for errors
    return NextResponse.json(
      {
        error: "Det oppstod en feil ved behandling av forespørselen",
        details: error instanceof Error ? error.message : String(error),
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

