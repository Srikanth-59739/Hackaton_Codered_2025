import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Mock login simulating Google OAuth & domain check
  function handleLogin() {
    const demoUser = {
      id: Date.now(),
      name: "Demo User",
      email: "user@example.edu",
      isAdmin: false  // set true if you want admin testing
    };
    login(demoUser);
    navigate("/profile");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] py-12">
      <button
        onClick={handleLogin}
        className="flex items-center gap-3 border p-3 rounded shadow text-lg hover:bg-gray-50"
      >
        <FcGoogle size={28} /> Login with Google
      </button>
      <p className="text-xs mt-4 text-gray-500">Demo login; no real OAuth yet</p>
    </main>
  );
}