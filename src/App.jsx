// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import UserList from "./features/UserList";
import ProjectForm from "./features/project/projectform";
import { Toaster } from "sonner";
import { Button } from "./components/ui/button"; // Đường dẫn tùy alias hoặc relative
import "./index.css";

function LayoutWithSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-1/6 bg-gray-100 p-4">
        <div className="space-y-1">
          <Button
            onClick={() => navigate("/")}
            className={`w-full ${location.pathname === "/" ? "bg-pink-500 text-white" : "bg-white text-black"} hover:bg-pink-600`}
          >
            Users
          </Button>
          <Button
            onClick={() => navigate("/projects")}
            className={`w-full ${location.pathname === "/projects" ? "bg-blue-500 text-white" : "bg-white text-black"} hover:bg-blue-600`}
          >
            Projects
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 ">
        <Routes>
          <Route path="/" element={<UserList />} />
          <Route path="/projects" element={<ProjectForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWithSidebar />
      <Toaster />
    </BrowserRouter>
  );
}
