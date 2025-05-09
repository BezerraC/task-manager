# Task Manager

Task Manager is a web-based application designed to help users efficiently manage their tasks and projects. This application is built with a **FastAPI** backend, a **Next.js** frontend, and uses **MongoDB** as its database.

## Features

- **User Authentication**: Secure user registration and login system.
- **Task Management**: Create, update, delete, and view tasks.
- **Project Organization**: Group tasks into projects for better organization.
- **Real-Time Updates**: Instant updates to tasks and projects using WebSockets.
- **Responsive Design**: Fully responsive UI for desktop and mobile devices.
- **Search and Filter**: Easily search and filter tasks by status, priority, or due date.

## Tech Stack

### Backend
- **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python.
- **Pydantic**: For data validation and settings management.
- **MongoDB**: NoSQL database for storing tasks and user data.
- **Motor**: Async driver for MongoDB.

### Frontend
- **Next.js**: React framework for building server-side rendered and static web applications.
- **Booststrap**: Utility-first CSS framework for styling.
- **Axios**: For making API requests.

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB installed locally or accessible via a cloud provider

### Backend Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/BezerraC/task-manager.git
    cd task-manager/backend
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Set up environment variables in a `.env` file:

5. Run the development server:
    ```bash
    py -m main
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Create a `.env.local` file and configure the API URL:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```
4. Run the development server:
    ```bash
    npm run dev
    ```
    
## Usage
1. Open the frontend in your browser at `http://localhost:3000`.
2. Register a new account or log in.
3. Start creating and managing your tasks and projects.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch.
4. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
