import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import SearchBar from "../components/SearchBar";
import "../index.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.status !== 200) {
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          fetchUserDetails();
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/user-details`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUserDetails(data.user);
      } else {
        console.error("Failed to fetch user details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const handleDropdownClick = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate("/")}>
        BOOKHIVE
      </div>

      <ul className="navbar-nav">
        <li><a href="/" className="nav-link">Home</a></li>
        <li><a href="/myBooks" className="nav-link">My Books</a></li>
        <li><a href="/genres" className="nav-link">Genre</a></li>
        <li><a href="/recommendations" className="nav-link">Recommendations</a></li>
        <li><a href="/community" className="nav-link">Community</a></li>
      </ul>

      <div className="navbar-search">
        <SearchBar onSearchResults={() => {}} />
      </div>

      <div className="navbar-actions">
        {!loggedIn ? (
          <>
            <button className="btn btn-primary" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn btn-secondary" onClick={() => navigate("/signup")}>
              Signup
            </button>
          </>
        ) : (
          <div className="user-profile">
            <div
              className="user-avatar"
              onClick={() => setShowPopup(!showPopup)}
              title="Account"
            >
              {userDetails.first_name?.[0] || 'A'}
            </div>

            {showPopup && (
              <div className="user-dropdown">
                <p>{userDetails.first_name || "-"} {userDetails.last_name || "-"}</p>
                <p>{userDetails.email || "-"}</p>
                <p>
                  <strong>Date of Birth:</strong>{" "}
                  {userDetails.dob
                    ? new Date(userDetails.dob).toLocaleDateString()
                    : "-"}
                </p>
                <button className="btn btn-primary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
