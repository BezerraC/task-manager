"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  useEffect(() => {
    const fetchProject = async () => {
      import("boxicons");
      const token = localStorage.getItem("access_token");

      const projectRes = await fetch(`${API_URL}/api/projects/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData);
        setName(projectData.name);
        setDescription(projectData.description);
        setDeadline(
          new Date(projectData.deadline).toISOString().substring(0, 10)
        );
      } else {
        setProject(null);
      }

      const tasksRes = await fetch(`${API_URL}/api/tasks?project_id=${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData);
      }
    };

    fetchProject();
  }, [API_URL, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const updatedProject = {
      name,
      description,
      deadline,
    };

    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProject),
    });

    if (response.ok) {
      router.push(`/projects/${id}`);
    } else {
      console.error("Failed to update project");
    }
  };

  const sortTasks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...tasks].sort((a, b) => {
      let aValue = a[key];
      let bValue = b[key];

      if (key === "deadline") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setTasks(sorted);
    setSortConfig({ key, direction });
  };

  if (project === null) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <div className="mt-5">
        <form onSubmit={handleSubmit}>
          <div className="d-flex align-items-start flex-wrap justify-content-between mb-3">
            <div className="d-flex flex-column ">
              <input
                type="text"
                className="form-control text-truncate mb-0 p-3 bg-itens border-0 text-white fw-bold m-0"
                style={{ fontSize: "2rem" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="text-secondary fs-6 m-0">{project.id}</p>
            </div>
            
          </div>
          <div className="d-flex flex-column gap-2">
            <textarea
              rows={3}
              className="form-control p-3 bg-itens border-0 text-white m-0"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <p className="text-secondary m-0 fs-6 ms-auto">
              Author: {project.assigned_by}
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 align-items-center justify-content-end"> 
              <button
                type="submit"
                href={`/projects/${project.id}/edit`}
                className="btn btn-light"
              >
                Update
              </button>
              <Link href={`/projects/${id}`} className="btn btn-outline-light">
                Cancel
              </Link>
            </div>
        </form>
      </div>

      <div className="mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-end gap-1">
            <h1 className="fw-bold text-muted">Tasks</h1>
            <p className="text-muted">({tasks.length})</p>
          </div>
          <Link
            href={`/projects/${id}/tasks/new`}
            className="btn btn-outline-light disabled"
          >
            New Task
          </Link>
        </div>
        {tasks.length > 0 ? (
          <>
            <div className="row px-4 mb-3 text-white">
              <div className="col d-flex align-items-center">
                <p className="m-0 text-muted">Name</p>
                <div className="disabled">
                  <box-icon
                    color="grey"
                    name="filter"
                    onClick={() => sortTasks("name")}
                  ></box-icon>
                </div>
              </div>
              <div className="col d-none d-sm-flex align-items-center">
                <p className="m-0 text-muted">Description</p>
                <div className="disabled">
                  <box-icon
                    color="grey"
                    name="filter"
                    onClick={() => sortTasks("description")}
                  ></box-icon>
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <p className="m-0 text-muted">Status</p>
                <div className="disabled">
                  <box-icon
                    color="grey"
                    name="filter"
                    onClick={() => sortTasks("status")}
                  ></box-icon>
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <p className="m-0 text-muted">Priority</p>
                <div className="disabled">
                  <box-icon
                    color="grey"
                    name="filter"
                    onClick={() => sortTasks("priority")}
                  ></box-icon>
                </div>
              </div>
              <div className="col d-none d-sm-flex justify-content-center">
                <p className="m-0 text-muted">Deadline</p>
                <div className="disabled">
                  <box-icon
                    color="grey"
                    name="filter"
                    onClick={() => sortTasks("deadline")}
                  ></box-icon>
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <p className="m-0 text-muted">Actions</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {currentTasks.map((task) => (
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-decoration-none c-disable disabled"
                  key={task.id}
                >
                  <div className="px-4 py-4 d-flex flex-row align-items-center rounded-4 bg-itens text-white">
                    <div className="col text-truncate" scope="row">
                      {task.title}
                    </div>
                    <div className="col d-none d-sm-block text-truncate">
                      {task.description}
                    </div>
                    <div className="col d-flex justify-content-center">
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
                    <div className="col d-flex justify-content-center">
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
                    </div>
                    <div className="col d-none d-sm-flex justify-content-center">
                      {new Date(task.due_date).toLocaleDateString()}
                    </div>
                    <div className="col d-flex justify-content-center">
                      <div className="dropdown ms-4">
                        <button
                          className="btn btn-outline-light pb-0 pt-2 px-1"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <box-icon
                            color="white"
                            name="dots-vertical-rounded"
                          ></box-icon>
                        </button>
                        <ul className="dropdown-menu">
                          <Link
                            href={`/tasks/${task.id}`}
                            className="dropdown-item"
                          >
                            View
                          </Link>
                          <Link
                            href={`/tasks/${task.id}`}
                            className="dropdown-item"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/tasks/${task.id}`}
                            className="dropdown-item"
                          >
                            Delete
                          </Link>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <nav
              className="my-3 d-flex flex-column flex-sm-row justify-content-center c-disable disabled"
              aria-label="Table navigation"
            >
              <div className="col d-none d-sm-block"></div>
              <ul className="col pagination d-flex align-items-center justify-content-center gap-2 m-0 ">
                <li className="page-item pt-1">
                  <button
                    className="btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    aria-label="Previous"
                  >
                    <box-icon color="white" name="chevron-left"></box-icon>
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li className="page-item" key={i}>
                    <button
                      className={`page-link rounded-2 ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className="page-item pt-1">
                  <button
                    className="btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    aria-label="Next"
                  >
                    <box-icon color="white" name="chevron-right"></box-icon>
                  </button>
                </li>
              </ul>

              <div className="col d-flex justify-content-sm-end justify-content-center align-items-center  mt-3 mt-sm-0">
                <label className="text-white me-2">Items per page:</label>
                <select
                  className="form-select w-auto"
                  data-bs-theme="dark"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </nav>
          </>
        ) : (
          <p className="text-white text-center">No tasks for this project.</p>
        )}
      </div>
    </main>
  );
}
