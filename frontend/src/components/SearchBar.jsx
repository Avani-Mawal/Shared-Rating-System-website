import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a4.5 4.5 0 1 1-6.388-6.388 4.5 4.5 0 0 1 6.388 6.388zm-.707-.707a3.5 3.5 0 1 0-.707.707l3.5 3.5a1 1 0 0 0 1.415-1.414l-3.5-3.5z"/>
            </svg>
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
