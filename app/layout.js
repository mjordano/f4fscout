import './globals.css';
import Header from '@/components/layout/Header';

export const metadata = {
  title: 'F4F Scout — Instagram Follow-for-Follow Intelligence',
  description: 'Discover Instagram profiles most likely to follow you back. Smart scoring, niche discovery, engagement analysis, and rich filtering.',
  keywords: 'instagram, follow for follow, f4f, instagram growth, social media tool',
  openGraph: {
    title: 'F4F Scout',
    description: 'Find Instagram profiles most likely to follow you back',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="page-wrapper">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
