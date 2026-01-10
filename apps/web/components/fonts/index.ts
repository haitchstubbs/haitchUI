import { Geist, Geist_Mono, Inter as Font_Inter, Space_Mono, Atkinson_Hyperlegible_Mono } from "next/font/google";
import { cn } from "../../lib/util";

const Sans = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
	display: "swap",
});
const Mono = Atkinson_Hyperlegible_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
	weight: ["400", "700"],
	display: "swap",
});

const Inter = Font_Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})


export { Sans, Mono, Inter };

export const fontVariables = cn(
  Sans.variable,
  Mono.variable,
  Inter.variable
)
