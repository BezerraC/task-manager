"use client";

export default function About() {
  return (
    <main>
      <div className="mt-5">
        <h1 className="fw-bold text-white mb-3">About</h1>

        <p className="mb-5 text-white">
          This system was developed to help users organize their daily tasks in
          a simple and efficient way. With features such as creation, editing,
          marking tasks as completed and organization by priority or date, it
          seeks to increase personal and professional productivity.
        </p>

        <h1 className="fw-bold text-white mb-3">Technologies Used</h1>

        <p className="mb-3 text-white">
          FastAPI: to create a lightweight and high-performance RESTful API.
        </p>
        <p className="mb-3 text-white">
          MongoDB: NoSQL database used to store tasks and users in a flexible
          way.
        </p>
        <p className="mb-5 text-white">
          Next.js: React framework used for the user interface with server-side
          rendering and great performance.
        </p>

        <h1 className="fw-bold text-white mb-3">Features</h1>
        <p className="mb-3 text-white">User registration and login</p>
        <p className="mb-3 text-white">
          Creation, editing and deletion of tasks
        </p>
        <p className="mb-3 text-white">Filter by fields</p>
        <p className="mb-3 text-white">Organization by dates and priority</p>
        <p className="mb-3 text-white">Responsive interface</p>
      </div>
    </main>
  );
}
