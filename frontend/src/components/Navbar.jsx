import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import SearchBar from "../components/SearchBar";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // ⬅️ Loading state

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.status !== 200) {
          setLoggedIn(false);
          setLoading(false); // ⬅️ Done loading, safe to show page
        } else {
          setLoggedIn(true);
          setLoading(false); // ⬅️ Done loading, safe to show page
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login"); // ⬅️ In case of error, redirect too
      }
    };

    checkLoginStatus();
  }, [navigate]);

  if (loading) return (
    <div className="loading">Loading...</div>
  );

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.status === 200) {
        setLoggedIn(false);
        navigate("/");
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
      <div className="navbar-logo" onClick={() => navigate("/")}>
        GoodReads Clone
      </div>

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

      <div className="navbar-search">
        <SearchBar onSearchResults={() => {}} />
      </div>

      <div className="navbar-actions">
        {loggedIn ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="signup-btn" onClick={() => navigate("/signup")}>
              Signup
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
