import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/sonner";
import ChatWidget from "@/components/grokChat";

const inter = Inter({ subsets: ["latin"]});

export const metadata = {
  title: "Sensai-AI Career Coach",
  description: "An AI-powered career coach that provides personalized guidance and support to help you achieve your career goals.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body  className={`${inter.className} `}>
        <ClerkProvider appearance={{
          theme: dark,
        }}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          ></ThemeProvider>
        {/*Header*/}
        <Header />
        <main className="min-h-screen">{children}</main>
        <Toaster richColors />
        {/*Footer*/}
        <footer className="bg-mute/50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-200 ">
          
          <ChatWidget /> 
        </div>
        </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
