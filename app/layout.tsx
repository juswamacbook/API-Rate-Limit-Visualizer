import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Rate Limit Visualizer",
  description: "Track and visualize API rate-limit headers."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
