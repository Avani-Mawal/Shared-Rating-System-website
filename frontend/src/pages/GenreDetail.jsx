import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/GenreDetail.css";

const GenreDetail = () => {
  const { genreName } = useParams();
  const [books, setBooks] = useState([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

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
            setDescription(data.description || "No description available.");
        } else {
          const error = await res.json();
          alert(error.message);
        }
      } catch (err) {
        console.error("Error loading genre:", err);
      }
      setLoading(false);
    };

    fetchGenreData();
  }, [genreName]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="genre-detail-container">
      <Navbar />
      <div className="genre-detail-content">
        <h1>{genreName.toUpperCase()}</h1>
        <p className="genre-description">{description}</p>
        <div className="genre-books-grid">
          { books ? (
            books.map((book, index) => (
              <a href = {`/books/${book.book_id}`} key={index} className="book-card">
              <div key={index} className="book-card">
                <img src={book.image_link} alt={book.title} />
                <h2>{book.name}</h2>
                <p>{book.publ_date}</p>
              </div>
              </a>
            ))
          ) : (
            <p>No books found for this genre.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenreDetail;
