"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import "boxicons";

export default function TaskPage() {
  const params = useParams();
  const id = params?.id;
  const [task, setTask] = useState(null);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    async function fetchTask() {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch task");
        }
        const data = await response.json();
        setTask(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchTask();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      router.push("/tasks");
    } catch (error) {
      console.error(error);
    }
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="mt-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-3">
              <h1 className="fw-bold text-white m-0">
                {task.title || "Unnamed task"}
              </h1>
              <span
                className={`badge fw-normal fs-6 ${
                  task.status === "Pending"
                    ? "text-bg-warning"
                    : task.status === "In Progress"
                    ? "text-bg-primary"
                    : task.status === "Completed"
                    ? "text-bg-success"
                    : "text-bg-secondary"
                }`}
              >
                {task.status}
              </span>
            </div>
            <p className="text-secondary fs-6 m-0">{task.id}</p>
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
              <Link href={`/tasks/${task.id}`} className="dropdown-item">
                Edit
              </Link>
              <Link href={`/tasks/${task.id}`} className="dropdown-item">
                Delete
              </Link>
            </ul>
          </div>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-3 gap-sm-5">
          <div className="col col-sm-9">
            <p className="text-white m-0 mb-3">{task.description}</p>
            <p className="text-secondary m-0 fs-6">{task.created_by}</p>
          </div>
          <div className="col">
            <p>
              Priority:{" "}
              <span
                className={`badge fw-normal fs-6 ${
                  task.priority === "Low"
                    ? "text-bg-primary"
                    : task.priority === "Medium"
                    ? "text-bg-warning"
                    : task.priority === "High"
                    ? "text-bg-danger"
                    : "text-bg-secondary"
                }`}
              >
                {task.priority}
              </span>
            </p>
            <p>Deadline: {new Date(task.due_date).toLocaleDateString()}</p>
            <p>Created at: {new Date(task.created_at).toLocaleDateString()}</p>
            <p>Updated at: {new Date(task.updated_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
