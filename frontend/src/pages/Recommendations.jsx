import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Recommendations.css";



const dummyBooks = [
  {
    id: 1,
    title: "One of Us is Lying",
    author: "Karen M. McManus",
    cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1494254082l/32682105.jpg",
  },
  {
    id: 2,
    title: "The Grandest Game",
    author: "Jennifer Lynn Barnes",
    cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1702222650l/199012556.jpg",
  },
  {
    id: 3,
    title: "Family of Liars",
    author: "E. Lockhart",
    cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1648232501l/58724646.jpg",
  },
  {
    id: 4,
    title: "The It Girl",
    author: "Ruth Ware",
    cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1639235350l/58724919.jpg",
  },
  {
    id: 5,
    title: "She's Not Sorry",
    author: "Mary Kubica",
    cover: "https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1698729381l/156751716.jpg",
  },
];

const Recommendations = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true); // ⬅️ Add this

  const getGenres = async (e) => {
    try {
      const response = await fetch(`${apiUrl}/user-genres`, {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 200) {
        const data = await response.json();
        setGenres(data.genres);
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error fetching genres:", error);
      alert("Failed to fetch genres. Please try again.");
    }
  }

  // const handleBooks = async (e) => {
  //   // e.preventDefault();
  //   const genre = e.target.genre.value;
  //   const shelf = e.target.shelf.value;
  //   try {
  //     const response = await fetch(`${apiUrl}/recommendations`, {
  //       method: "POST",
  //       credentials: "include",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ genre, shelf }),
  //     });
  //     if (response.status === 200) {
  //       const data = await response.json();
  //       setBooks(data.books);
  //     } else {
  //       const errorData = await response.json();
  //       alert(errorData.message);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recommendations:", error);
  //     alert("Failed to fetch recommendations. Please try again.");
  //   }
  // };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.status !== 200) {
          navigate("/login");
        } else {
        setBooks([]); // ⬅️ Set books only if logged in
        getGenres(); // ⬅️ Fetch genres
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


  return (
    <div className="home-container">
      <Navbar />
      <div className="main-wrapper">
        <div className="recommendation-category">
          Recommendations by Genre or Shelf 
          <form>
            <select className="genre-select">
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <select className="shelf-select">
              <option value="read">Read</option>
              <option value="currently-reading">Currently Reading</option>
              <option value="want-to-read">Want to Read</option>
            </select>
            <button className="green-button" type="submit">Get Recommendations</button>
          </form>
        </div>
        {books.length > 0 && (
          <main className="recommendation-content">
            <h2>Recommendations &gt; <span>Thriller Genre</span></h2>
            <p className="recommendation-text">
              Here are some books we recommend based on the books you’ve added in this genre. Other readers with similar interests have enjoyed them.
            </p>
            <div className="book-grid">
              {books.map((book) => (
                <div key={book.id} className="book-card">
                  <img
                    src={book.cover}
                    alt={book.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Image-not-found.png";
                    }}
                  />
                  <button className="green-button">Want to Read</button>
                  <div className="stars">☆☆☆☆☆</div>
                  <div className="not-interested">Not interested</div>
                </div>
              ))}
            </div>
          </main>
        )}

      </div>
    </div>
  );
};

export default Recommendations;
