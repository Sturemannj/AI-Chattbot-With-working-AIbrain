import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Velkommen til Senior Chat Assistent</h1>

        <div className="space-y-4 text-left mb-8">
          <p className="text-lg">Denne chatboten er laget spesielt for å hjelpe deg med å:</p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Få svar på spørsmål om teknologi, helse, nyheter og mer</li>
            <li>Få hjelp med daglige gjøremål og informasjon</li>
            <li>Lære nye ting på en enkel og forståelig måte</li>
          </ul>

          <p className="text-lg mt-4">Slik bruker du chatboten:</p>

          <ol className="list-decimal pl-6 space-y-2">
            <li>Skriv spørsmålet ditt i tekstfeltet</li>
            <li>Trykk på Send-knappen eller trykk Enter</li>
            <li>Vent på svar fra assistenten</li>
            <li>Du kan trykke på høyttaler-ikonet for å få svaret lest opp</li>
            <li>Bruk A+ og A- knappene for å endre tekststørrelsen</li>
          </ol>
        </div>

        <Link href="/chat" passHref>
          <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-6 py-3">Start samtalen</Button>
        </Link>
      </div>
    </div>
  )
}

