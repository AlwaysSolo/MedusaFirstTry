import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Anybody, Space_Mono } from "next/font/google"
import "styles/globals.css"

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-anybody",
  display: "swap",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="dark" className={`${anybody.variable} ${spaceMono.variable}`}>
      <body>
        <main className="relative bg-background text-on-background">{props.children}</main>
      </body>
    </html>
  )
}

