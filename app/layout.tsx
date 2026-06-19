import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hiroshima Mon Amour — Mémoire et Oubli",
  description: "Un juego de memoria (memotest) mobile-first inspirado en la obra cinematográfica de Alain Resnais y Marguerite Duras. Explora la tensión entre recordar y olvidar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream-50 text-charcoal-900 selection:bg-hiroshima-500 selection:text-white">
        <div className="film-grain" />
        <div className="vignette" />
        {children}
      </body>
    </html>
  );
}

