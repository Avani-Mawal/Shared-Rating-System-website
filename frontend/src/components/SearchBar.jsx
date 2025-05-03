import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import { FaSearch } from "react-icons/fa";
import "../css/SearchBar.css";

const SearchBar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [books, setBooks] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const resultsToShow = 5; // Number of results to show in the dropdown

    const fetchSearchResults = async (searchQuery) => {
      if (!searchQuery.trim()) {
        setBooks([]);
        setShowDropdown(false);
        return;
      }
      try {
        const response = await fetch(`${apiUrl}/search?q=${searchQuery}`);
        const data = await response.json();
        if (response.status !== 200) {
          alert(data.message);
          return;
        }
        console.log("Search results:", data.books);
        setBooks(data.books);
        setShowDropdown(true);
      } catch (error) {
        console.error("Search error:", error);
        setBooks([]);
        setShowDropdown(false);
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      setShowDropdown(false);
      console.log("Search query submitted:", query);
      console.log("Books to navigate:", books);
      navigate(`/search?query=${query}`, { state: { books: books, query : query } });
    };
  
    useEffect(() => {
      fetchSearchResults(query);
    }, [query]);
    
  return (
    <section className="search">
        <form onSubmit={handleSubmit} className="search-bar">
        <input
            type="text"
            placeholder="Enter book name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
        />
        <button type="submit" className="search-button">
          <FaSearch size={18} />
        </button>
        </form>
        {showDropdown && books.length > 0 && (
        <ul className="dropdown-menu">
          {books.map((book, index) => (
            index < resultsToShow && (
            <li key={book.book_id} className="dropdown-item" onClick={() => navigate(`/books/${book.book_id}`)}>
             <img src={book.image_link} class = "dropdown-img"/>  {book.name}
            </li>)
          ))}
          <li className="dropdown-item" onClick={handleSubmit}> See all results</li>
        </ul>
      )}
    </section>
  );
};

export default SearchBar;
