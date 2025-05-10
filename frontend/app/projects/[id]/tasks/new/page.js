"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "boxicons";

export default function NewTaskPage({ params }) {
  const { id: projectId } = params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("normal");
  const [status, setStatus] = useState("Pending");
  const [projectName, setProjectName] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchProject = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProjectName(data.name);
        } else {
          console.error("Error to fetch project");
        }
      } catch (error) {
        console.error("Error to fetch project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const mapPriority = (value) => {
    switch (value.toLowerCase()) {
      case "low":
        return "Low";
      case "normal":
        return "Medium";
      case "high":
        return "High";
      default:
        return "Medium";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const isoDueDate = dueDate
      ? new Date(dueDate + "T23:59:59").toISOString()
      : null;

    const res = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        description,
        due_date: isoDueDate,
        priority: mapPriority(priority),
        status,
        project_id: projectId,
        assigned_to: user?.name || "Unknown",
      }),
    });

    if (res.ok) {
      router.push(`/projects/${projectId}`);
    } else {
      const errorData = await res.json();
      console.error("Error to create task:", errorData);
    }
  };

  if (!user) return null;

  return (
    <main
      className="d-flex align-items-start mt-5"
      style={{ minHeight: "89vh" }}
    >
      <div className="form-signin w-100 mx-auto" style={{ maxWidth: "850px" }}>
        <form onSubmit={handleSubmit}>
          <h1 className="mb-4 text-center fw-bold text-white">
            New task for: {projectName || "..."}
          </h1>

          <div className="d-flex flex-column flex-sm-row gap-3">
            <div className="col col-sm-8">
              <input
                type="text"
                className="form-control mb-3 p-3 bg-itens border-0 text-white"
                placeholder="Task name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <textarea
                className="form-control p-3 bg-itens border-0 text-white"
                rows="4"
                placeholder="Task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="col">
              <input
                type="date"
                className="form-control mb-3 p-3 bg-itens border-0 text-white"
                placeholder="Task deadline"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              <select
                className="form-select bg-dark text-light border border-secondary p-3 mb-3"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option disabled>Select status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                className="form-select bg-dark text-light border border-secondary p-3 mb-3"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option disabled>Select Priority</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <button className="btn btn-outline-light w-100 py-3" type="submit">
            Create
          </button>
        </form>
      </div>
    </main>
  );
}
