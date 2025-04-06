import React, { useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

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

  const handleDropdownClick = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("/")}>GoodReads Clone</div>
      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/myBooks">My Books</a>

        <div
          className="dropdown"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <span className="dropdown-toggle">Browse ▾</span>
          {showDropdown && (
            <div className="dropdown-menu">
              <div onClick={() => handleDropdownClick("/genres")}>Genre</div>
              <div onClick={() => handleDropdownClick("/recommendations")}>Recommendations</div>
            </div>
          )}
        </div>

        <a href="/community">Community</a>
      </div>
      <div className="navbar-actions">
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
