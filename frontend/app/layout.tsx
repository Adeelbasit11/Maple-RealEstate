import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./components/Providers";

export const metadata: Metadata = {
  title: "First Website - Next.js TypeScript",
  description: "Next.js + TypeScript conversion of First Website",
};  // ye metadata Next.js 13 ke app directory ke liye hai, jo ki page ke head me automatically include ho jata hai. Isme title aur description define kiya gaya hai, jo ki SEO aur browser tab me dikhai dega.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
