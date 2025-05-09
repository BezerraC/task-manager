'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === "/login" || pathname === "/register";

  return (
    <>
      {!hideLayout && <Navbar />}
      <div className="container" style={{ minHeight: '85vh' }}>
        {children}
      </div>
      {<Footer />}
    </>
  );
}
