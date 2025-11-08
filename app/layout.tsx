import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus CRM",
  description: "Professional CRM solution for managing clients and cases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
