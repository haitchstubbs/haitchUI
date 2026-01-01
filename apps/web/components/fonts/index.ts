import { Geist, Geist_Mono } from "next/font/google";

const Sans = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans",
    weight: ["400", "700"],
    display: "swap",
});
const Mono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    weight: ["400", "700"],
    display: "swap",
});

export { Sans, Mono };