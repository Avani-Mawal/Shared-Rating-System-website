import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import { Link } from "react-router";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);

  // Check login and redirect if logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.status === 200) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkLoginStatus();
  }, [navigate]);

  // Fetch trending books
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

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(handleNext, 5000);
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
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Loading...</div>;
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          height: "90vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          color: "#fff",
          textAlign: "center",
          borderBottomLeftRadius: "50px",
          borderBottomRightRadius: "50px",
        }}
      >
        <img
          src="/image.jpeg"
          alt="background"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            top: 0,
            left: 0,
            zIndex: -2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "100%",
            background: "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3))",
            zIndex: -1,
          }}
        />
        <div
          style={{
            zIndex: 2,
            maxWidth: "700px",
            padding: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "5rem",
              fontWeight: "bold",
              marginBottom: "20px",
              fontFamily: "'Comic Sans MS', cursive",
            }}
          >
            Unlimited books, reviews & more
          </h1>

          <p
            style={{
              fontSize: "1.2rem",
              marginBottom: "30px",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Screens down, books up!
          </p>
          <button
            onClick={() => navigate("/signup")}
            style={{
              backgroundColor: "#e50914",
              color: "white",
              fontSize: "1.1rem",
              padding: "12px 28px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "0.3s ease",
              boxShadow: "0 4px 14px rgba(229, 9, 20, 0.5)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f6121d")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#e50914")
            }
          >
            Join for Free
          </button>
        </div>
      </section>

      {/* Trending Books Carousel */}
      <section style={{ marginTop: "50px", padding: "0 20px", position: "relative" }}>
        <h2
          style={{
            marginBottom: "20px",
            color: "#333",
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginTop: "20px",
            fontFamily: "'Cinzel', serif",
          }}
        >
          Trending
        </h2>
        <div style={{ position: "relative" }}>
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            style={arrowButtonStyle("left")}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)")
            }
          >
            <LeftArrow />
          </button>

          {/* Carousel */}
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
                  backgroundColor: "#fff",
                  boxShadow:
                    index === currentIndex
                      ? "0 4px 10px rgba(0, 0, 0, 0.4)"
                      : "0 2px 5px rgba(0, 0, 0, 0.2)",
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

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            style={arrowButtonStyle("right")}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.8)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)")
            }
          >
            <RightArrow />
          </button>
        </div>
      </section>
    </div>
  );
};

// Arrow button styles helper
const arrowButtonStyle = (position) => ({
  position: "absolute",
  top: "50%",
  [position]: "-10px",
  transform: "translateY(-50%)",
  zIndex: 10,
  backgroundColor: "rgba(0,0,0,0.6)",
  border: "none",
  borderRadius: "50%",
  padding: "10px",
  cursor: "pointer",
  color: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  transition: "background 0.3s",
});

// SVG arrows
const LeftArrow = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path
      fillRule="evenodd"
      d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
    />
  </svg>
);

const RightArrow = () => (
  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path
      fillRule="evenodd"
      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
    />
  </svg>
);

export default Home;