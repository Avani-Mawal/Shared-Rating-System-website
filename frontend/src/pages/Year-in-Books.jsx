import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import { Link } from "react-router";

const Year_Books = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [year, setYear] = useState(new Date().getFullYear());
  const [pagesRead, setPagesRead] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [topAuthors, setTopAuthors] = useState([]); 

  const handlePrev = () => {
    setYear(year - 1);
  }

  const handleNext = () => {
    setYear(year + 1);
  }

  const fethcDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/year-in-books/${year}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) {
        setPagesRead(data.pagesRead);

      } else {
        console.error("Error fetching pages read:", data.message);
      }
    } catch (error) {
      console.error("Error fetching pages read:", error);
    }
  };

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
          fethcDetails();
          setUsername(data.username);
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



  return (
    <div>
        <Navbar />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
            <button onClick={handlePrev} style={{ padding: "5px 10px", margin:"10px" }}>←</button> 
            <h2>{year}</h2>
            {year !== new Date().getFullYear() && (
                <button onClick={handleNext} style={{ padding: "5px 10px", margin:"10px"  }}>→</button>
                )}
        </div>
        <h1>My {year} in Books</h1>
        <div class="year-in-books">
            <div class="Pages Read">
                <h2>Pages Read</h2>
                <p>{pagesRead}</p>
            </div>
            <div class="year-in-books-content">
                <h2>Books Read</h2>
                <p>{booksRead}</p>
            </div>
            <div class="Top Authors">
                <h2>Top Authors</h2>
                {topAuthors.length > 0 ? (
                    topAuthors.map((author, index) => (
                        <p key={index}>{author}</p>
                    ))
                ) : (
                    <p>No authors found.</p>
                )}
            </div>
        </div>            
    </div>
  );
};

export default Year_Books;