import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import { Link } from "react-router";
// import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        await response.json();
        if (response.status === 200) {
          navigate("/dashboard");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
    setBooks([]);
  }, [navigate]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch(`${apiUrl}/top-rated-books`);
        const data = await response.json();
        setTrendingBooks(data.books || []);
      } catch (error) {
        console.error("Error fetching trending books:", error);
      }
    };
    fetchTrending();
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  });

  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const childWidth = container.firstChild?.offsetWidth || 160;
      container.scrollTo({
        left: childWidth * index,
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % trendingBooks.length;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex =
      (currentIndex - 1 + trendingBooks.length) % trendingBooks.length;
    setCurrentIndex(prevIndex);
    scrollToIndex(prevIndex);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <Navbar />

      <section className="hero">
        <h1>Discover & Share Books You Love</h1>
        <p>Track your reading, review books, and connect with other readers.</p>
        <button onClick={() => navigate("/signup")}>Join for Free</button>
      </section>

      {/* Trending Books Carousel */}
      <section className="popular-books">
        <h2 style={{ margin: "30px 20px 10px", color: "#333", textAlign: "left" }}>
          Trending 🔥
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={handlePrev} style={{ padding: "5px 10px" }}>←</button>

          <div
            ref={scrollRef}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollBehavior: "smooth",
              padding: "10px 0",
              gap: "15px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
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
                  boxShadow:
                    index === currentIndex
                      ? "0 4px 10px rgba(0, 0, 0, 0.4)"
                      : "0 2px 5px rgba(0, 0, 0, 0.2)",
                  backgroundColor: "#fff",
                  transform: index === currentIndex ? "scale(1.05)" : "scale(1)",
                  transition: "transform 0.3s, box-shadow 0.3s",
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

          <button onClick={handleNext} style={{ padding: "5px 10px" }}>→</button>
        </div>
      </section>

    </div>
  );
};

export default Home;

