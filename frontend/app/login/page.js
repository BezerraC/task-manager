"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access_token", data.access_token);

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user_id,
            name: data.name,
            email: data.email,
            role: data.role,
          })
        );

        router.push("/");
      } else {
        const data = await response.json();
        setError(data.detail || "Error to login");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Connection error");
    }
  };

  return (
    <main
      className="d-flex align-items-center py-4"
      style={{ minHeight: "89vh" }}
    >
      <div className="form-signin w-100 m-auto" style={{ maxWidth: "430px" }}>
        <form onSubmit={handleSubmit}>
          <h1 className="h3 mb-4 text-center fw-bold text-white">Login</h1>

          {error && <p className="text-danger">{error}</p>}

          <input
            type="email"
            className="form-control mb-3 p-3 bg-itens border-0 text-white"
            id="floatingInput"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="form-control p-3 bg-itens border-0 text-white"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="form-check text-start my-3">
            <input
              className="form-check-input text-white"
              type="checkbox"
              value="remember-me"
              id="checkDefault"
            />
            <label className="form-check-label" htmlFor="checkDefault">
              Remember me
            </label>
          </div>

          <button className="btn btn-outline-light w-100 py-3" type="submit">
            Login
          </button>

          <p className="mt-3 mb-3 text-center">
            Don&apos;t have an account? {""}
            <Link className="link-underline-light" href="/register">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
