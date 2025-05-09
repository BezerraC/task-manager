"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import "boxicons";

export default function ProjectPage() {
  const params = useParams();
  const id = params?.id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  useEffect(() => {
    const fetchProjectAndTasks = async () => {
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
        console.log(projectData);
      } else {
        setProject(null);
        return;
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

    fetchProjectAndTasks();
  }, [API_URL, id]);

  if (project === null) {
    return <div>Project not found.</div>;
  }

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

  return (
    <main>
      <div className="mt-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex flex-column">
            <h1 className="fw-bold text-white m-0">
              {project.name || "Unnamed project"}
            </h1>
            <p className="text-secondary fs-6 m-0">{project.id}</p>
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
              <Link href={`/projects/${project.id}`} className="dropdown-item">
                Edit
              </Link>
              <Link href={`/projects/${project.id}`} className="dropdown-item">
                Delete
              </Link>
            </ul>
          </div>
        </div>
        <div className="d-flex flex-column gap-2">
          <p className="text-white m-0">{project.description}</p>
          <p className="text-secondary m-0 fs-6 ms-auto">{project.author_id}</p>
        </div>
      </div>

      <div className="mt-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-end gap-1">
            <h1 className="fw-bold text-white">Tasks</h1>
            <p>({tasks.length})</p>
          </div>
          <Link
            href={`/projects/${id}/tasks/new`}
            className="btn btn-outline-light"
          >
            New Task
          </Link>
        </div>
        {tasks.length > 0 ? (
          <>
            <div className="row px-4 mb-3 text-white">
              <div className="col d-flex align-items-center">
                <p className="m-0 text-white">Name</p>
                <box-icon
                  color="white"
                  name="filter"
                  onClick={() => sortTasks("name")}
                  style={{ cursor: "pointer" }}
                ></box-icon>
              </div>
              <div className="col d-none d-sm-flex align-items-center">
                <p className="m-0 text-white">Description</p>
                <box-icon
                  color="white"
                  name="filter"
                  onClick={() => sortTasks("description")}
                  style={{ cursor: "pointer" }}
                ></box-icon>
              </div>
              <div className="col d-flex justify-content-center">
                <p className="m-0 text-white">Status</p>
                <box-icon
                  color="white"
                  name="filter"
                  onClick={() => sortTasks("status")}
                  style={{ cursor: "pointer" }}
                ></box-icon>
              </div>
              <div className="col d-flex justify-content-center">
                <p className="m-0 text-white">Priority</p>
                <box-icon
                  color="white"
                  name="filter"
                  onClick={() => sortTasks("priority")}
                  style={{ cursor: "pointer" }}
                ></box-icon>
              </div>
              <div className="col d-none d-sm-flex justify-content-center">
                <p className="m-0 text-white">Deadline</p>
                <box-icon
                  color="white"
                  name="filter"
                  onClick={() => sortTasks("deadline")}
                  style={{ cursor: "pointer" }}
                ></box-icon>
              </div>
              <div className="col d-flex justify-content-center">
                <p className="m-0 text-white">Actions</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              {currentTasks.map((task) => (
                <div
                  className="px-4 py-4 d-flex flex-row align-items-center rounded-4 bg-itens text-white"
                  key={task.id}
                >
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
                          href={`/task/${task.id}`}
                          className="dropdown-item"
                        >
                          View
                        </Link>
                        <Link
                          href={`/task/${task.id}`}
                          className="dropdown-item"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/task/${task.id}`}
                          className="dropdown-item"
                        >
                          Delete
                        </Link>
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <nav
              className="my-3 d-flex flex-column flex-sm-row justify-content-center"
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
