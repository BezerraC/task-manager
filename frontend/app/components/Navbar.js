"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      setUserName(user.name);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    router.push("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light py-3 px-0 px-sm-4"
      data-bs-theme="dark"
    >
      <div className="container">
        <Link className="navbar-brand" href="/">
          <Image src="/logo.svg" alt="Logo" width={135} height={57} />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="d-flex flex-column flex-sm-row w-100">
            <div className="col d-none d-sm-block"></div>
            <ul className="col navbar-nav mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link text-white ${
                    pathname === "/" ? "active" : "" 
                  }`}
                  href="/"
                >
                  Projects
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link text-white ${
                    pathname === "/tasks" ? "active" : ""
                  }`}
                  href="/tasks"
                >
                  Tasks
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link text-white ${
                    pathname === "/about" ? "active" : ""
                  }`}
                  href="/about"
                >
                  About
                </Link>
              </li>
            </ul>
            <ul className="col navbar-nav ms-sm-auto ms-0 d-flex gap-sm-2 gap-0 justify-content-sm-end justify-content-center">
              {isLoggedIn ? (
                <>
                  <li className="nav-item">
                    <button
                      className="nav-link text-white"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </li>
                  <li className="nav-item">
                    <span className="btn btn-light">{userName}</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link me-2 text-white" href="/login">
                      Login
                    </Link>
                  </li>
                  <Link className="btn btn-light" href="/register">
                    Register
                  </Link>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
