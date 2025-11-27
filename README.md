# Event Management

This project is an event management application with a React frontend and a Node.js backend.

## Project Structure

The project is a monorepo with two main directories:

-   `frontend`: Contains the React application.
-   `backend`: Contains the Node.js (Express) application.

## Getting Started

To get the application running locally, follow these steps.

### Prerequisites

-   Node.js (v14 or later)
-   npm
-   MongoDB (local or a cloud instance like MongoDB Atlas)

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the `backend` directory and add the following environment variables. You can use `.env.example` as a template.

    ```
    PORT=4000
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    FRONTEND_ORIGIN=http://localhost:3000
    ```

4.  **Seed the database:**
    This command will populate the database with initial data, including user profiles.

    ```bash
    npm run seed
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The backend will be running on `http://localhost:4000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a `.env` file in the `frontend` directory and add the following environment variable to point to your local backend:

    ```
    REACT_APP_API_URL=http://localhost:4000/api
    ```

4.  **Start the development server:**
    ```bash
    npm start
    ```
    The frontend application will open in your browser at `http://localhost:3000`.

## Logging In

The application uses an email-based login. The seed data creates the following profiles. To log in, use one of the following emails. There is no password required for login with these seed profiles.

-   **Admin Email:** `admin@gmail.com`
-   **User Emails:** `user1@gmail.com`, `user2@gmail.com`