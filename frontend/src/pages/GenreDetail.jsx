import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/GenreDetail.css";

const GenreDetail = () => {
  const navigate = useNavigate();
  const { genreName } = useParams();
  const [books, setBooks] = useState([]);
  const [isUserGenre, setIsUserGenre] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [description, setDescription] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const booksPerPage = 15;
  function capitalizeWords(str) {
    return str.toLowerCase().split(' ').map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }

  const updateFavorties = async (addOrRemove) => {
    console.log(addOrRemove);

    try {
      const res = await fetch(`${apiUrl}/update-fav`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ genre: capitalizeWords(genreName), action: addOrRemove }),
      });
  
      if (res.status === 200) {
        if (addOrRemove === 1){
          setIsUserGenre(true);
          alert("Added to Favorites successfully!");
        }else{
          alert("Removed from Favorites successfully!");
          setIsUserGenre(false);

        }

      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Error removing genre from favorites:", err);
    }
  }

  const genreDesc = async () => {
    try {
      const res = await fetch(`${apiUrl}/genre-description`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ genre: capitalizeWords(genreName) }),
      });
      if (res.status === 200) {
        const data = await res.json();
        setDescription(data.description);
      } else {
        const error = await res.json();
        alert(error.message);
      }
    } catch (err) {
      console.error("Error loading genre description:", err);
    }
  }

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/user-genres`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // setUserDetails(data.user);
        console.log(data.genres);
        console.log(capitalizeWords(genreName));
        if (data.genres.includes(capitalizeWords(genreName))) {
          setIsUserGenre(true);
        } 
      } else {
        console.error("Failed to fetch user details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

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
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    const fetchGenreData = async () => {
      try {
        const capitalized =
        genreName.charAt(0).toUpperCase() + genreName.slice(1)
        // Pass an array to the API with only the genre name
        const genres = [capitalized];
        const res = await fetch(`${apiUrl}/genre-books`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ genres: genres }),
        });

        if (res.status === 200) {
            const data = await res.json();
            if (!data.books || data.books.length === 0) {
                alert("No books found for this genre.");
                return;
            }
            console.log("Genre data:", data.books[capitalized]);
            setBooks(data.books[capitalized]);
          } else {
          const error = await res.json();
          alert(error.message);
        }
      } catch (err) {
        console.error("Error loading genre:", err);
      }
      setLoading(false);
    };
    checkLoginStatus();
    fetchGenreData();
    genreDesc();
  }, [loggedIn, isUserGenre]);

  const totalPages = Math.ceil(books.length / booksPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getBooksToShow = () => {
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    return books.slice(startIndex, endIndex);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="genre-detail-container">
      <Navbar />
      <div className="genre-detail-content">
        <h1>{genreName.toUpperCase()}</h1>
        <p className="genre-description">{description}</p>
        {
          !loggedIn && (
            <button
            onClick={() => navigate('/login')}
            className="have-favorite-btn"
          >
            Login to have Favorites!
          </button>
          )
        }

        {loggedIn && 
          !isUserGenre && (
          <button
            onClick={() => updateFavorties(1)}
            className="add-favorite-btn"
          >
            Add to Favorite Genres
          </button>
        )}
        {loggedIn && 
          isUserGenre && (
            <button  onClick={() => updateFavorties(0)}
            className="remove-favorite-btn">
              Remove from Favorite Games
            </button> 
          )
        }
        <div className="genre-books-grid">
          {getBooksToShow().length > 0 ? (
            getBooksToShow().map((book, index) => (
              <a
                href={`/books/${book.book_id}`}
                key={index}
                className="book-card"
              >
                  <img src={book.image_link} alt={book.title} />
                  <h2>{book.name}</h2>
                  <p>{book.publ_date}</p>
              </a>
            ))
          ) : (
            <p>No books found for this genre.</p>
          )}
        </div>
        <div className="pagination-controls">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenreDetail;
