import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

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

  if (loading) return <div>Loading author details...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!author) return <div>Author not found.</div>;

  return (
    <>
      <Navbar />
      <div
        style={{
          maxWidth: "1000px",
          margin: "40px auto",
          padding: "20px",
          backgroundColor: "#fdfaf6",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
          }}
        >
          {author.image_link && (
            <img
              src={author.image_link}
              alt={author.name}
              style={{
                width: "160px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <div>
            <h2 style={{ marginBottom: "10px" }}>{author.name}</h2>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: "1.6",
                color: "#444",
              }}
            >
              {author.bio}
            </p>
          </div>
        </div>

        <h3 style={{ marginTop: "40px", marginBottom: "20px" }}>
          Books by {author.name}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "16px",
          }}
        >
          {books.length > 0 ? (
            books.map((book) => (
              <Link
                to={`/books/${book.book_id}`}
                key={book.book_id}
                style={{
                  background: "#fff",
                  padding: "10px",
                  borderRadius: "10px",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <img
                  src={book.image_link}
                  alt={book.name}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div
                  style={{
                    marginTop: "8px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {book.name}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                  }}
                >
                  Rating: {book.avg_rating || "N/A"}
                </div>
              </Link>
            ))
          ) : (
            <p>No books found for this author.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthorDetails;
