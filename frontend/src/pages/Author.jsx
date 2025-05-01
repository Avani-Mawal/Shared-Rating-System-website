import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Author.css";

const AuthorDetails = () => {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuthorDetails = async () => {
      try {
        const res = await fetch(`${apiUrl}/authors/${authorId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok) {
          setAuthor(data.author);
          setBooks(data.books || []);
        } else {
          setError(data.message || "Failed to load author details.");
        }
      } catch (err) {
        console.error("Error fetching author details:", err);
        setError("Something went wrong while fetching author details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthorDetails();
  }, [authorId]);

  if (loading) return <div className="loading">Loading author details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!author) return <div className="not-found">Author not found.</div>;

  return (
    <>
      <Navbar />
      <div className="author-container">
        <div className="author-header">
          {author.image_link && (
            <img
              src={author.image_link}
              alt={author.name}
              className="author-image"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div className="author-info">
            <h2 className="author-name">{author.name}</h2>
            <p className="author-bio">{author.bio}</p>
          </div>
        </div>

        <h3 className="books-title">Books by {author.name}</h3>

        <div className="books-grid">
          {books.length > 0 ? (
            books.map((book) => (
              <Link
                to={`/books/${book.book_id}`}
                key={book.book_id}
                className="book-card"
              >
                <img
                  src={book.image_link}
                  alt={book.name}
                  className="book-image"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div className="book-title">{book.name}</div>
                <div className="book-rating">
                  Rating: {book.avg_rating || "N/A"}
                </div>
              </Link>
            ))
          ) : (
            <p className="no-books">No books found for this author.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorDetails;
