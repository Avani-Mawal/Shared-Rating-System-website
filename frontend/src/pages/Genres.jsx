import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import Modal from 'react-modal';
import { FaSearch } from 'react-icons/fa';
import "../css/Genres.css";


const Genres = () => {
  const navigate = useNavigate();
  const [genreQuery, setGenreQuery] = useState("");
  const [genreToShow, setGenreToShow] = useState([]);
  const [genreBooks, setGenreBooks] = useState({});
  const [allGenres, setAllGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track loading for both allGenres and genreBooks
  const [genresLoaded, setGenresLoaded] = useState(false);
  const [favGenresLoaded, setFavGenresLoaded] = useState(false);

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
            setGenreToShow(data.genres.slice(0, 10)); // Show only the first 10 genres
            setGenresLoaded(true);
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
                    setFavGenresLoaded(true);
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
            getAllGenres(); // ⬅️ Fetch all genres
            getGenres(); // ⬅️ Fetch genres
            }
          } catch (error) {
            console.error("Error checking login status:", error);
            navigate("/login"); // ⬅️ In case of error, redirect too
          }
        };
    
        checkLoginStatus();
      }, [navigate]);

  useEffect(() => {
    if (genresLoaded && favGenresLoaded) {
      setLoading(false);
    }
  }, [genresLoaded, favGenresLoaded]);

  const handleGenreSearch = (e) => {
    e.preventDefault();
    const filteredGenres = allGenres.filter(genre => 
      genre.genre_name.toLowerCase().includes(genreQuery.toLowerCase())
    );
    setSearchResults(filteredGenres);
  };

    if (loading) {
        return <div className="loading">Loading...</div>;
    };

  return (
    <div className="genres-container">
      <Navbar />
      <div className="genre-main">
        <div
          className="genre-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0',
            marginBottom: '12px',
            maxWidth: '100%'
          }}
        >
          <h1 style={{ margin: 0 }}>Genres</h1>
          <form onSubmit={handleGenreSearch} className="genre-search-form" style={{ position: 'relative', width: '340px', marginLeft: '32px', height: '50px' }}>
            <input
              type="text"
              value={genreQuery}
              onChange={e => {
                setGenreQuery(e.target.value);
                if (e.target.value.length > 0) {
                  const filtered = allGenres.filter(genre =>
                    genre.genre_name.toLowerCase().includes(e.target.value.toLowerCase())
                  );
                  setSearchResults(filtered);
                } else {
                  setSearchResults([]);
                }
              }}
              placeholder="Find a genre by name"
              autoComplete="off"
              style={{ width: '100%' }}
            />
            {genreQuery && searchResults.length > 0 && (
              <div className="genre-search-dropdown">
                {searchResults.map(g => (
                  <div
                    key={g.genre_name}
                    className="genre-search-dropdown-item"
                    onClick={() => {
                      window.location.href = `/genre/${g.genre_name.toLowerCase()}`;
                      setGenreQuery('');
                      setSearchResults([]);
                    }}
                  >
                    {g.genre_name}
                  </div>
                ))}
              </div>
            )}
            <button type="submit" aria-label="Search">
              <FaSearch size={18} />
            </button>
          </form>
        </div>

        <div className="genre-body">
          <div className="genre-left">
            {Object.entries(genreBooks).map(([genre, books]) => (
              <div key={genre} className="genre-section">
                <h2>{genre.toUpperCase()}</h2>
                <div className="genre-book-row">
                  {books.slice(0, 8).map((book, idx) => (
                    <a href={`/books/${book.book_id}`} key={book.book_id}> <img src={book.image_link} alt={book.name}
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
                {genreToShow.map((g) => <a href= {`/genre/${g.genre_name.toLowerCase()}`} key={g.genre_name}>{g.genre_name}</a>)}
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
        <div className="all-genres-list">
          <ul>
            {(allGenres).map((g) => (
              <li ><a href= {`/genre/${g.genre_name.toLowerCase()}`} key={g}>{g.genre_name} </a> </li>
              ))}
          </ul>
          <button onClick={closeModal}>Close</button>
          
        </div>
      </Modal>
    </div>
  );
};

export default Genres;
