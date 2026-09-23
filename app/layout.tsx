import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alumni Tracking System",
  description: "Istanbul University MIS alumni tracking platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
