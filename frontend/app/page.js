"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    import("boxicons");
    const fetchProjects = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_URL}/api/projects`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.log("Failed to fetch projects", res.status);
          return;
        }

        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    };

    fetchProjects();
  }, [API_URL]);

  const sortProjects = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...projects].sort((a, b) => {
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

    setProjects(sorted);
    setSortConfig({ key, direction });
  };

  const handleDelete = async (projectId) => {
    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProjects((prev) =>
          prev.filter((project) => project.id !== projectId)
        );
      } else {
        const errorData = await res.json();
        alert("Failed to delete: " + (errorData.detail || res.status));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting project");
    }
  };

  return (
    <main>
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-end gap-1">
            <h1 className="fw-bold text-white">Projects</h1>
            <p>({projects.length})</p>
          </div>
          <Link className="btn btn-outline-light" href="/projects/new">
            New Project
          </Link>
        </div>

        <div className="row px-4 mb-3 text-white">
          <div className="col d-flex align-items-center">
            <p className="m-0 text-white">Name</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortProjects("name")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-none d-sm-flex align-items-center">
            <p className="m-0 text-white">Description</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortProjects("description")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-flex justify-content-center">
            <p className="m-0 text-white">Status</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortProjects("status")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-none d-sm-flex justify-content-center">
            <p className="m-0 text-white">Deadline</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortProjects("deadline")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-flex justify-content-center">
            <p className="m-0 text-white">Actions</p>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {currentProjects.map((project) => (
            <div className="px-4 py-4 d-flex flex-row align-items-center rounded-4 gap-3 bg-itens text-white" key={project.id}>
              <div className="col text-truncate" scope="row">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-decoration-none" 
                >
                  {project.name}
                </Link>
              </div>
              <div className="col d-none d-sm-block text-truncate">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-decoration-none"
                >
                  {project.description}
                </Link>
              </div>
              <div className="col d-flex justify-content-center">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-decoration-none"
                >
                  <span
                    className={`badge fw-normal fs-6 ${
                      project.status === "Pending"
                        ? "text-bg-warning"
                        : project.status === "In Progress"
                        ? "text-bg-primary"
                        : project.status === "Completed"
                        ? "text-bg-success"
                        : "text-bg-secondary"
                    }`}
                  >
                    {project.status}
                  </span>
                </Link>
              </div>
              <div className="col d-none d-sm-flex justify-content-center">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-decoration-none"
                >
                  {new Date(project.deadline).toLocaleDateString()}
                </Link>
              </div>

              <div className="col d-flex justify-content-center">
                <div className="dropdown ms-4">
                  <button
                    className="btn pb-0 pt-2 px-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <box-icon
                      color="white"
                      name="dots-vertical-rounded"
                    ></box-icon>
                  </button>
                  <ul className="dropdown-menu z-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="dropdown-item"
                    >
                      View
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="dropdown-item"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="dropdown-item"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteModal"
                      onClick={() =>
                        setProjectToDelete({
                          id: project.id,
                          name: project.name,
                        })
                      }
                    >
                      Delete
                    </button>
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </nav>
      </div>

      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered ">
          <div className="modal-content bg-itens text-white">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-5" id="deleteModalLabel">
                Confirm Delete
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              This action will <b>permanently delete</b> the project{" "}
              <div class="alert alert-danger my-2 p-2" role="alert">
                {projectToDelete?.name}
              </div>{" "}
              and all related tasks. Are you sure?
            </div>
            <div className="modal-footer border-0 d-flex flex-column align-items-stretch">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                onClick={() => handleDelete(projectToDelete?.id)}
              >
                Delete
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
