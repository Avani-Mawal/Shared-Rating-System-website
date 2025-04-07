import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import Modal from 'react-modal';
import "../css/Genres.css";


const Genres = () => {
  const navigate = useNavigate();
  const [genreQuery, setGenreQuery] = useState("");
  const [genreToShow, setGenreToShow] = useState([]);
  const [genreBooks, setGenreBooks] = useState({});
  const [allGenres, setAllGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };



  const getAllGenres = async () => {
    try {
        const response = await fetch(`${apiUrl}/all-genres`, {
            method: "GET",
            credentials: "include",
        });
        if (response.status === 200) {
            const data = await response.json();
            setAllGenres(data.genres);
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error("Error fetching all genres:", error);
        alert("Failed to fetch all genres. Please try again.");
    }
    };


  const getGenres = async () => {
    try {
        const response = await fetch(`${apiUrl}/user-genres`, {
            method: "GET",
            credentials: "include",
        });
        if (response.status === 200) {
            const data = await response.json();
            setGenreToShow(data.genres);
            console.log(data.genres);
            try {
                const books = await fetch (`${apiUrl}/genre-books`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ genres: data.genres }),
                });
                if (books.status === 200) {
                    const bookData = await books.json();
                    setGenreBooks(bookData.books);
                } else {
                    const errorData = await books.json();
                    alert(errorData.message);
                }
            } catch (error) {
                console.error("Error fetching genre books:", error);
            }
        } else {
            const errorData = await response.json();
            alert(errorData.message);
        }
    } catch (error) {
        console.error("Error fetching genres:", error);
    }
    };  

    useEffect(() => {
        const checkLoginStatus = async () => {
          try {
            const response = await fetch(`${apiUrl}/isLoggedIn`, {
              credentials: "include",
            });
            if (response.status !== 200) {
              navigate("/login");
            } else {
            
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

  const handleGenreSearch = (e) => {
    e.preventDefault();
    alert(`Searching for genre: ${genreQuery}`);
  };

    if (loading) {
        return <div className="loading">Loading...</div>;
    };

  return (
    <div className="genres-container">
      <Navbar />
      <div className="genre-main">
        <div className="genre-header">
          <h1>Genres</h1>
          <form onSubmit={handleGenreSearch} className="genre-search-form">
            <input
              type="text"
              value={genreQuery}
              onChange={(e) => setGenreQuery(e.target.value)}
              placeholder="Find a genre by name"
            />
            <button type="submit">Find Genre</button>
          </form>
        </div>

        <div className="genre-body">
          <div className="genre-left">
            {Object.entries(genreBooks).map(([genre, books]) => (
              <div key={genre} className="genre-section">
                <h2>{genre.toUpperCase()}</h2>
                <div className="genre-book-row">
                  {books.map((book, idx) => (
                    <a href = {`/books/${book.book_id}`}> <img key={idx} src={book.image_link} alt={book.name}
                    onError={(e) => e.target.src = './Image-not-found.png'} 
                    /></a>
                  ))}
                </div>
                <a href={`/genre/${genre.toLowerCase()}`} className="more-genre-link"> More {genre.toLowerCase()}...</a>
              </div>
            ))}
          </div>

          <div className="genre-right">
            <div className="browse-genres">
              <h3>BROWSE</h3>
              <div className="genre-list">
                {allGenres.map((g) => <a href= {`/genre/${g.toLowerCase()}`} key={g}>{g}</a>)}
              </div>
              <a className="more-genres-link" href="#" onClick={openModal}>More genres...</a>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="All Genres"
      >
        <h2>All Genres</h2>
        <button onClick={closeModal}>Close</button>
        <div className="all-genres-list">
          {Object.keys(allGenres).map((g) => (
            <a href= {`/genre/${g.toLowerCase()}`} key={g}>{g}</a>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Genres;
