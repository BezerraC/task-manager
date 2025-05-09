'use client';
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
      <div className="container">
        <footer className="d-flex flex-wrap justify-content-between align-items-center py-3 mt-4">
          <p className="col-md-4 mb-0"><Link href="https://www.cbezerra.com/">cbezerra.com</Link> © {currentYear}</p>
  
          <ul className="nav col-md-4 justify-content-end">
            <li className="nav-item">
              <Link href="#" className="nav-link px-2 text-light">Repository</Link>
            </li>
            <li className="nav-item">
              <Link href="#" className="nav-link px-2 text-light">Find a bug?</Link>
            </li>
          </ul>
        </footer>
      </div>
    );
  }
  