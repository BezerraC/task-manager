"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.detail || "Erro ao registrar");
      }
    } catch (error) {
      setError("Erro de conexão");
    }
  };

  return (
    <main
      className="d-flex align-items-center py-4"
      style={{ minHeight: "89vh" }}
    >
      <div
        className="form-signin w-100 m-auto"
        style={{ maxWidth: "430px" }}
      >
        <form onSubmit={handleSubmit}>
          <h1 className="h3 mb-4 text-center fw-bold text-white">Register</h1>

          {error && <p className="text-danger">{error}</p>}

          <input
            type="text"
            className="form-control mb-3 p-3 bg-itens border-0 text-white"
            id="floatingInput"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            className="form-control mb-3 p-3 bg-itens border-0 text-white"
            id="floatingPassword"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-outline-light w-100 py-3" type="submit">
            Register
          </button>

          <p className="mt-3 mb-3 text-center">
            Already have an account?{" "}
            <Link className="link-underline-light" href="/login">
              Sign in here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
