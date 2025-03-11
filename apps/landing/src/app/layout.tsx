import type { Metadata } from "next";
import "./globals.css";
import Fathom from "@/component/Fathom";

export const metadata: Metadata = {
  title: "WeWorks",
  description:
    "WeWorks is a self-hosted issue tracker for your projects or help desk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Fathom />
        {children}
      </body>
    </html>
  );
}
