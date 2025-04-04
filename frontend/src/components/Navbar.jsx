import React from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.status === 200) {
        navigate("/login");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>GoodReads Clone</div>
      <div className="navbar-links">
        <a href="/dashboard">Home</a>
        <a href="/myBooks">My Books</a>
        <a href="/community"></a>
      </div>
      <div className="navbar-actions">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
