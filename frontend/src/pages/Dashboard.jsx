import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import { Link } from "react-router";
import "../css/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [newreleaseBooks, setnewreleaseBooks] = useState([]);
  const [userDetails, setUserDetails] = useState({});

  // Check login status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.status === 200) {
          setUsername(data.username);
          fetchUserDetails();
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // Fetch user details
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

  // // Logout function
  // const handleLogout = async () => {
  //   try {
  //     const response = await fetch(`${apiUrl}/logout`, {
  //       method: "POST",
  //       credentials: "include",
  //     });
  //     if (response.ok) {
  //       navigate("/login");
  //     } else {
  //       console.error("Logout failed");
  //     }
  //   } catch (error) {
  //     console.error("Error during logout:", error);
  //   }
  // };

  // Fetch trending books
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${apiUrl}/top-rated-books`);
        const data = await response.json();
        setTrendingBooks(data.books);
      } catch (error) {
        console.error("Error fetching trending books:", error);
      }
    };
    fetchTrending();
  }, []);

  // Fetch new releases
  useEffect(() => {
    const fetchNewRealeases = async () => {
      try {
        const response = await fetch(`${apiUrl}/new-releases-books`);
        const data = await response.json();
        setnewreleaseBooks(data.books);
      } catch (error) {
        console.error("Error fetching new releases:", error);
      }
    };
    fetchNewRealeases();
  }, []);

  return (
    <div>
      <Navbar />

      {/* Banner */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "300px",
          backgroundImage:
            "url('https://www.euroschoolindia.com/wp-content/uploads/2023/08/books-by-sudha-murthy.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            padding: "20px 40px",
            borderRadius: "10px",
            fontSize: "28px",
            fontWeight: "bold",
            color: "#5A3A22",
            textAlign: "center",
            maxWidth: "90%",
          }}
        >
          Welcome to BookReads, {username}!
        </div>
      </div>

      {/* Trending Books */}
      <h2 style={{ margin: "30px 20px 10px", color: "#333", textAlign: "left" }}>
        Trending 🔥
      </h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px 20px",
          gap: "15px",
        }}
      >
        {trendingBooks.map((book, index) => (
          <div
            key={index}
            style={{
              minWidth: "160px",
              maxWidth: "160px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              backgroundColor: "#fff",
            }}
          >
            <Link to={`/books/${book.book_id}`}>
              <img
                src={book.image_link}
                alt={book.name}
                style={{
                  width: "100%",
                  height: "240px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Link>
            <div
              style={{
                padding: "10px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              <Link
                to={`/books/${book.book_id}`}
                style={{ color: "blue", textDecoration: "none" }}
              >
                {book.name}
              </Link>
            </div>
            <div
              style={{
                padding: "0 10px 10px",
                color: "#777",
                fontSize: "13px",
              }}
            >
              Rating: {book.avg_rating}
            </div>
          </div>
        ))}
      </div>

      {/* New Releases */}
      <h2 style={{ margin: "30px 20px 10px", color: "#333", textAlign: "left" }}>
        New Releases 📚
      </h2>
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px 20px",
          gap: "15px",
        }}
      >
        {newreleaseBooks.map((book, index) => (
          <div
            key={index}
            style={{
              minWidth: "160px",
              maxWidth: "160px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              backgroundColor: "#fff",
            }}
          >
            <Link to={`/books/${book.book_id}`}>
              <img
                src={book.image_link}
                alt={book.name}
                style={{
                  width: "100%",
                  height: "240px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Link>
            <div
              style={{
                padding: "10px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              <Link
                to={`/books/${book.book_id}`}
                style={{ color: "blue", textDecoration: "none" }}
              >
                {book.name}
              </Link>
            </div>
            <div
              style={{
                padding: "0 10px 10px",
                color: "#777",
                fontSize: "13px",
              }}
            >
              Rating: {book.avg_rating}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;