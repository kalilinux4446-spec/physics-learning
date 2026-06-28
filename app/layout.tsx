import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "فيزياء ذكية — نظام تعلم الفيزياء التفاعلي",
  description: "نظام تعليمي متكامل لمادة الفيزياء للصف الثاني ثانوي — شرح تفاعلي، معمل افتراضي، ذكاء اصطناعي",
  keywords: ["فيزياء", "الصف الثاني ثانوي", "تعلم تفاعلي", "ذكاء اصطناعي"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
