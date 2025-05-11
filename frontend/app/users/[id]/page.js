"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import "boxicons";

export default function UserPage() {
  const params = useParams();
  const id = params?.id;
  const [user, setUser] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchUser();
  }, [id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="mt-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-3">
              <h1 className="fw-bold text-white m-0">
                {user.name}
              </h1>
              <span
                className={`badge fw-normal fs-6 ${
                  user.role === "admin"
                    ? "text-bg-warning"
                    : user.role === "user"
                    ? "text-bg-primary"
                    : user.role === "leader"
                    ? "text-bg-success"
                    : "text-bg-secondary"
                }`}
              >
                {user.role}
              </span>
            </div>
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
        <div className="d-flex flex-column flex-sm-row gap-3 gap-sm-5">
          <div className="col col-sm-9">
            <p className="text-white m-0 mb-3">Email: {user.email}</p>
            <p>Created at: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
