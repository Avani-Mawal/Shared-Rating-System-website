import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Recommendations.css";


const Recommendations = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedShelf, setSelectedShelf] = useState("");
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

  const getShelves = async (e) => {
    try {
      const response = await fetch(`${apiUrl}/shelves`, {
        method: "GET",
        credentials: "include",
      });
      if (response.status === 200) {
        const data = await response.json();
        const shelves = await data.shelves.map(shelf => shelf.shelf_name);
        setShelves(shelves);
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error fetching shelves:", error);
      alert("Failed to fetch shelves. Please try again.");
    }
  }

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
        getShelves(); // ⬅️ Fetch shelves
        setLoading(false); // ⬅️ Done loading, safe to show page
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login"); // ⬅️ In case of error, redirect too
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value); // Update selectedGenre state
  };

  const handleGenreRec = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      console.log("Selected genre:", selectedGenre);
      if (selectedGenre === "Select Genre" || selectedGenre === "") {
        alert("Please select a genre");
        return;
      }
      const response = await fetch(`${apiUrl}/get-recommendations-from-genre`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedGenre })
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log("Recommendations data:", data);
        setBooks(data.books);
      } else {
        const errorData = await response.json();
        setBooks([]);
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to fetch recommendations. Please try again.");
    }
  }

  const handleShelfChange = (event) => {
    setSelectedShelf(event.target.value); // Update selectedShelf state
  };

  const handleShelfRec = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      console.log("Selected shelf:", selectedShelf);
      if (selectedShelf === "Select Shelf" || selectedShelf === "") {
        alert("Please select a shelf");
        return;
      }
      const response = await fetch(`${apiUrl}/get-recommendations-from-shelf`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ selectedShelf: selectedShelf })
      });
      if (response.status === 200) {
        const data = await response.json();
        console.log("Recommendations data:", data);
        setBooks(data.books);
      } else {
        const errorData = await response.json();
        setBooks([]);
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to fetch recommendations. Please try again.");
    }
  };

  const handleBookRec = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      if (selectedShelf !== "Select Shelf" && selectedShelf !== "") {
        if (selectedGenre !== "Select Genre" && selectedGenre !== "") {
          alert("Please select only one section");
          return;
        }
        handleShelfRec(e);
      } else if (selectedGenre !== "Select Genre" && selectedGenre !== "") {
        handleGenreRec(e);
      } else {
        alert("Please select a book or genre");
        return;
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      alert("Failed to fetch recommendations. Please try again.");
    }
  };

  if (loading) return (
    <div className="loading">Loading...</div>
  );


  return (
    <div className="container">
      <Navbar />
      <div className="main-wrapper">
        <div className="recommendation-category">
          <h2>Recommendations by Genre or Shelf</h2>
          <form className="recommendation-form">
            By Genre : 
            <select className="genre-select" value={selectedGenre} onChange={handleGenreChange}>
              <option value="Select Genre">Select Genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            By Shelf : 
            <select className="genre-select" value={selectedShelf} onChange={handleShelfChange}>
              <option value="Select Shelf">Select Shelf</option>
              <option value="Read">Read</option>
              <option value="Currently Reading">Currently Reading</option>
              <option value="Want to Read">Want to Read</option>
              {shelves.map((shelf) => (
                <option key={shelf} value={shelf}>{shelf}</option >
              ))}
            </select>
            <button className="green-button" type="submit" onClick={handleBookRec}>Get Recommendations</button>
          </form>
        </div>
        {books.length > 0 && (
          <main className="recommendation-content">
            <h2>Recommendations &gt; <span>{selectedShelf === "Select Shelf" || selectedShelf === "" ? selectedGenre : selectedShelf}</span></h2>
            <p className="recommendation-text">
              Here are some books we recommend based on the books you’ve added in this section. Other readers with similar interests have enjoyed them.
            </p>
            <div className="book-grid">
              {books.map((book) => (
                <div key={book.book_id} className="book-card">
                  <a href={`/books/${book.book_id}`}>
                  <img
                    src={book.image_link}
                    alt={book.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Image-not-found.png";
                    }}
                  />
                  <h3>{book.name}</h3>
                  <button className="green-button">Want to Read</button>
                  <div className="stars"></div>
                  </a>
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
