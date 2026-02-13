import NavBar from "@/components/NavBar";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
        {/* soft background */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-72 w-[44rem] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-40 right-[-6rem] h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
        </div>

        <NavBar />

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
