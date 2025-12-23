import { Geist, Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-geist-mono",
});

const geistSans = Geist({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-geist-sans",
});

export { geistSans, geistMono };