import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <Link to="/" className="text-2xl font-bold text-blue-600">
        StudySync
      </Link>
      <ul className="hidden md:flex gap-6 items-center text-gray-700 font-medium">
        <li>
          <NavLink to="/" className={({isActive}) => isActive ? "text-blue-600" : ""}>Home</NavLink>
        </li>
        {user && (
          <>
            <li>
              <NavLink to="/discover" className={({isActive}) => isActive ? "text-blue-600" : ""}>Discover Groups</NavLink>
            </li>
            <li>
              <NavLink to="/mygroups" className={({isActive}) => isActive ? "text-blue-600" : ""}>My Groups</NavLink>
            </li>
            <li>
              <NavLink to="/create" className={({isActive}) => isActive ? "text-blue-600" : ""}>Create Group</NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={({isActive}) => isActive ? "text-blue-600" : ""}>Profile</NavLink>
            </li>
            {user.isAdmin && (
              <li>
                <NavLink to="/admin" className={({isActive}) => isActive ? "text-blue-600" : ""}>Admin</NavLink>
              </li>
            )}
            <li>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline font-semibold"
              >
                Logout
              </button>
            </li>
          </>
        )}
        {!user && (
          <li>
            <NavLink to="/login" className={({isActive}) => isActive ? "text-blue-600" : ""}>
              Login
            </NavLink>
          </li>
        )}
      </ul>
      {/* Mobile menu TODO: Optional */}
    </nav>
  );
}