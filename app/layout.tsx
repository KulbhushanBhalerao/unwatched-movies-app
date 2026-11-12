import type { Metadata } from "next";
import "./globals.css";
import { SeenProvider } from "@/components/SeenProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Unwatched – find your next movie",
  description: "Search movies, see where to stream them, track what you've seen, and pick what to watch next.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen">
        <SeenProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </SeenProvider>
      </body>
    </html>
  );
}
