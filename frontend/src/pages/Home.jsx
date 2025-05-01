import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import { Link } from "react-router";
import "../index.css";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const scrollRef = useRef(null);
  const isTransitioning = useRef(false);

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
        // Add clones at the start and end for infinite loop
        const books = data.books || [];
        if (books.length > 0) {
          setTrendingBooks([books[books.length - 1], ...books, books[0]]);
        }
      } catch (error) {
        console.error("Error fetching trending books:", error);
      }
    };
    fetchTrending();
  }, []);

  const scrollToIndex = (index) => {
    if (scrollRef.current && !isTransitioning.current) {
      isTransitioning.current = true;
      const container = scrollRef.current;
      const childWidth = container.firstChild?.offsetWidth || 180;
      const gap = 16; // 1rem gap
      const scrollPosition = (childWidth + gap) * index;
      
      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });

      // Reset transition flag after animation
      setTimeout(() => {
        isTransitioning.current = false;
      }, 400); // Match the CSS transition duration
    }
  };

  const handleNext = () => {
    if (isTransitioning.current) return;
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);

    // If we're at the last clone, jump to the real first item
    if (nextIndex === trendingBooks.length - 1) {
      setTimeout(() => {
        setCurrentIndex(1);
        scrollRef.current.scrollTo({
          left: 0,
          behavior: "auto",
        });
      }, 400); // Match the CSS transition duration
    }
  };

  const handlePrev = () => {
    if (isTransitioning.current) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    scrollToIndex(prevIndex);

    // If we're at the first clone, jump to the real last item
    if (prevIndex === 0) {
      setTimeout(() => {
        setCurrentIndex(trendingBooks.length - 2);
        scrollRef.current.scrollTo({
          left: (trendingBooks.length - 2) * (180 + 16),
          behavior: "auto",
        });
      }, 400); // Match the CSS transition duration
    }
  };

  // Auto-scroll carousel with smoother timing
  useEffect(() => {
    const interval = setInterval(handleNext, 6000); // Increased to 6 seconds for smoother feel
    return () => clearInterval(interval);
  }, [currentIndex, trendingBooks.length]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      {/* Hero Section */}
      <section className="hero">
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
        <div className="hero-content">
          <h1>Unlimited books, reviews & more</h1>
          <p>Screens down, books up!</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/signup")}
          >
            Join for Free
          </button>
        </div>
      </section>

      {/* Trending Books Carousel */}
      <section className="carousel-container">
        <h2 className="section-title">Trending</h2>
        <button
          className="carousel-arrow left"
          onClick={handlePrev}
        >
          <LeftArrow />
        </button>

        <div className="carousel" ref={scrollRef}>
          {trendingBooks.map((book, index) => (
            <div
              key={`${book.book_id}-${index}`}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            >
              <Link to={`/books/${book.book_id}`}>
                <img
                  src={book.image_link}
                  alt={book.name}
                  className="book-cover"
                />
                <div className="book-info">
                  <h3 className="book-title">{book.name}</h3>
                  <p className="book-author">{book.author_name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <button
          className="carousel-arrow right"
          onClick={handleNext}
        >
          <RightArrow />
        </button>
      </section>
    </div>
  );
};

const LeftArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RightArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default Home;