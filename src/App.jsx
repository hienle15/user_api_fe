import React from "react";
import UserList from "./features/UserList";
import "./index.css"
import UserForm from "./features/UserForm";
import { Toaster } from "sonner"; // Change this import

export default function App() {
  return (
    <div className="w-full">
      <UserList />
      <Toaster />
    </div>
  )
}