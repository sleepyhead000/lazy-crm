import { Type } from "next/font/google";

const inter = Type({
  subsets: ["latin"],
  variable: "--font-body",
});

const georgia = Type({
  subsets: ["latin"],
  variable: "--font-display",
  style: "normal",
  weight: "400",
});

export const fonts = `${inter.variable} ${georgia.variable}`;
