import './globals.css';

export const metadata = {
  title: 'Picnic — La revista del arte fino',
  description:
    'Picnic Magazine: periodismo de arte fino. Eventos, entrevistas, videos y revistas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
