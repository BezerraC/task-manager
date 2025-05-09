"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProject() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Pending");
  const [error, setError] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, description, deadline, status }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Erro ao criar projeto");
      }

      const result = await response.json();
      router.push(`/projects/${result.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main
      className="d-flex align-items-start mt-5"
      style={{ minHeight: "89vh" }}
    >
      <div className="form-signin w-100 mx-auto" style={{ maxWidth: "430px" }}>
        <form onSubmit={handleSubmit}>
          <h1 className="mb-4 text-center fw-bold text-white">
            New Project
          </h1>

          {error && <p className="text-danger">{error}</p>}

          <input
            type="text"
            className="form-control mb-3 p-3 bg-itens border-0 text-white"
            id="floatingInput"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="datetime-local"
            className="form-control mb-3 p-3 bg-itens border-0 text-white"
            id="floatingInput"
            placeholder="Project deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <select
            class="form-select bg-dark text-light border border-secondary p-3 mb-3"
            aria-label="Default select example"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option disabled selected>
              Select status
            </option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <textarea
            type="text"
            className="form-control mb-3 p-3 bg-itens border-0 text-white"
            id="inputDescription"
            rows="3"
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>

          <button className="btn btn-outline-light w-100 py-3" type="submit">
            Create
          </button>
        </form>
      </div>
    </main>
  );
}
