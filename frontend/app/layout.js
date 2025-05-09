import { Geist, Geist_Mono } from "next/font/google";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import BootstrapClient from './BootstrapClient';
import ClientLayout from './components/ClientLayout';

export const metadata = {
  title: "Task Manager",
  description: "Create and manage your tasks easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
