import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Smart Furnitures | Quality Furniture in Kahawa Sukari",
    template: "%s | Smart Furnitures",
  },

  description:
    "Discover furniture for your home with Smart Furnitures in Kahawa Sukari, Thika Road, Kenya. Explore sofas, chairs, tables and more. Contact us for prices, availability and delivery options.",

  applicationName: "Smart Furnitures",

  keywords: [
    "Smart Furnitures",
    "furniture in Kahawa Sukari",
    "furniture Thika Road",
    "sofas in Kenya",
    "beds in Kenya",
    "home furniture Kenya",
    "living room furniture",
    "dining furniture Kenya",
    "furniture shop near Kahawa Sukari",
  ],

  openGraph: {
    title: "Smart Furnitures | Furniture for Better Living",
    description:
      "Explore thoughtfully selected furniture for your home. Contact Smart Furnitures in Kahawa Sukari, Thika Road, Kenya.",
    type: "website",
    locale: "en_KE",
    siteName: "Smart Furnitures",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}