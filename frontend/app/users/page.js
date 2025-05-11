"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    import("boxicons");
    const fetchUsers = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${API_URL}/api/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.log("Failed to fetch users", res.status);
          return;
        }

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    };

    fetchUsers();
  }, [API_URL]);

  const sortUsers = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...users].sort((a, b) => {
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

    setUsers(sorted);
    setSortConfig({ key, direction });
  };

  return (
    <main>
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-end gap-1">
            <h1 className="fw-bold text-white">Users</h1>
            <p>({users.length})</p>
          
         </div>
        </div>

        <div className="row px-4 mb-3 text-white">
          <div className="col d-flex align-items-center">
            <p className="m-0 text-white">Name</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortUsers("name")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-none d-sm-flex align-items-center">
            <p className="m-0 text-white">Email</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortUsers("email")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-flex justify-content-center">
            <p className="m-0 text-white">Role</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortUsers("role")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-none d-sm-flex justify-content-center">
            <p className="m-0 text-white">Created at</p>
            <box-icon
              color="white"
              name="filter"
              onClick={() => sortUsers("created_at")}
              style={{ cursor: "pointer" }}
            ></box-icon>
          </div>
          <div className="col d-flex justify-content-center">
            <p className="m-0 text-white">Actions</p>
          </div>
        </div>

        <div className="d-flex flex-column gap-3">
          {currentUsers.map((user) => (
            <Link href={`/users/${user.id}`} className="text-decoration-none" key={user.id}>
              <div
                className="px-4 py-4 d-flex flex-row align-items-center rounded-4 bg-itens text-white"
              >
                <div className="col" scope="row">
                  {user.name}
                </div>
                <div className="col d-none d-sm-block text-truncate">
                  {user.email}
                </div>
                <div className="col d-flex justify-content-center">
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
                <div className="col d-none d-sm-flex justify-content-center">
                  {new Date(user.created_at).toLocaleDateString()}
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
                        href={`/users/${user.id}`}
                        className="dropdown-item"
                      >
                        View
                      </Link>
                      <Link
                        href={`/users/${user.id}`}
                        className="dropdown-item"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/users/${user.id}`}
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
    </main>
  );
}
