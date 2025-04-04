import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Home.css";


const Home = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        await response.json();
        if (response.status !== 200) {
            navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();

    // Fetch popular books (dummy data)
    setBooks([]);
  }, [navigate]);

  return (
    <div className="home-container">
      <Navbar />
      <section className="hero">
        <h1>Recommendations</h1>
        <p>Here are some books we think you'll love.</p>
        <button onClick={() => navigate("/signup")}>Join for Free</button>
      </section>

      <section className="popular-books">
        <h2>Popular Books</h2>
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Goodreads Clone. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
