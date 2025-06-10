# User Management Frontend

This is the frontend for the **User Management API** built with **React**, **Vite**, **Tailwind CSS**, and **Redux Toolkit**. It connects to the backend API built with Node.js, Express, and TypeScript.

##  Live Project

 Frontend: [https://github.com/hienle15/user\_api\_fe](https://github.com/hienle15/user_api_fe)
 Backend: [https://github.com/hienle15/user\_api](https://github.com/hienle15/user_api)

##  Features

*  View all users
*  Create a user
*  Update a user
*  Delete a user
*  Toast notifications for actions
* API integration with Axios
*  Global state management with Redux Toolkit


## Tech Stack

* React + Vite
* Redux Toolkit
* Axios
* Tailwind CSS
* Shadcn/ui (for reusable UI components)

##  Installation
npm install

### 1. Clone the repository


git clone https://github.com/hienle15/user_api_fe.git



### 2. Install dependencies

npm install


### 3. Run the development server

npm run dev

## Project Structure

src/
├── app/                 # Redux store setup
├── components/          # Reusable UI components
├── features/            # User-related components and logic
├── hooks/               # Custom hooks
├── assets/              # Static files (icons, images)
└── main.jsx             # App entry point
    App.jsx              # Root App component
