"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import "boxicons";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/api/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    fetchUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="mt-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex flex-column">
            <h1 className="fw-bold text-white m-0">
              {user.name}
            </h1>
            <p className="text-secondary fs-6 m-0">{user.id}</p>
          </div>
          <div className="dropdown">
            <button
              className="btn pb-0 pt-2 px-1"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <box-icon color="white" name="dots-vertical-rounded"></box-icon>
            </button>
            <ul className="dropdown-menu">
              <Link href={`/users/${user.id}`} className="dropdown-item">
                Edit
              </Link>
              <Link href={`/users/${user.id}`} className="dropdown-item">
                Delete
              </Link>
            </ul>
          </div>
        </div>
        <div className="d-flex flex-column gap-3">
          <p className="text-white m-0">Email: {user.email}</p>
          <p className="text-white m-0">Role: {user.role}</p>
        </div>
      </div>
    </main>
  );
}
