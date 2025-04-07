import React, { useEffect, useState, use } from "react";
import { apiUrl } from "../config/config";
import { useLocation, useSearchParams } from "react-router";
import Navbar from "../components/Navbar";
// import "../css/Home.css"; // optional, reuse your styles

const Search = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) {
      setBooks([]);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/search?q=${query}`);
      const data = await response.json();
      setBooks(data.books);
    } catch (error) {
      console.error("Search error:", error);
      setBooks([]);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [query]);

  return (
    <div className="home-container">
      <Navbar />

      <section className="hero">
        <h1>Search for Books</h1>
        <p>Find your next favorite read by title, author, or keyword.</p>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Enter book name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </section>

      <section className="popular-books">
        {books.length === 0 && query !== "" ? (
          <p>No books found.</p>
          ) : (
            <div className="books-grid">
            {books.length === 0 ? (<p>Search for a book to see results.</p>) : null}
            {books.map((book) => (
              <a href={`/books/${book.book_id}`} key={book.book_id} className="book-card">
                <div key={book.book_id} className="book-card">
                  <img
                    src={book.image_link}
                    alt={book.name}
                    className="book-image"
                  />
                  <h3>{book.name}</h3>
                  <p>Rating: {book.avg_rating}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>© 2025 Goodreads Clone. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Search;
