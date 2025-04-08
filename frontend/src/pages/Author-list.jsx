import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";

const AuthorList = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch(`${apiUrl}/authors`);
        const data = await res.json();

        if (res.ok) {
          setAuthors(data.authors);
        } else {
          setError(data.message || "Failed to load authors.");
        }
      } catch (err) {
        console.error("Failed to fetch authors:", err);
        setError("Something went wrong while fetching authorssss.");
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <>
      <Navbar />

      <style>{`
        .author-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 24px;
          padding: 10px 20px;
        }

        .author-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #fdfaf6;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          padding: 16px;
          transition: transform 0.2s ease;
        }

        .author-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .author-image {
          width: 100px;
          height: 120px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .author-name {
          color: #3b3b3b;
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
        }
      `}</style>

      <div style={{ backgroundColor: "#f7f5f2", minHeight: "100vh", padding: "30px" }}>
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "20px" }}>
          📚 Authors
        </h2>

        {loading && <p style={{ textAlign: "center" }}>Loading authors...</p>}
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {!loading && !error && (
          <div className="author-grid">
            {authors.map((author) => (
              <Link
                to={`/authors/${author.author_id}`}
                key={author.author_id}
                className="author-card"
              >
                <img
                  src={author.image_link}
                  alt={author.name}
                  className="author-image"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div className="author-name">{author.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AuthorList;