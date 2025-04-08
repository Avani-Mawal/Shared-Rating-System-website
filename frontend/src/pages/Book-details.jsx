import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
// import { Link } from "react-router";
import "../css/Book-details.css";

const Book = () => {
  const navigate = useNavigate();
  const { bookId } = useParams(); // assuming the URL is like /books/:bookId
  const [book, setBook] = useState(null);
  const [author, setAuthor] = useState("");
  const [shelves, setShelves] = useState([]);
  const [rating, setRating] = useState(0);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [genres, setGenres] = useState([]);
  const [newShelf, setNewShelf] = useState("");
  const [Reviews, setReviews] = useState([]);
  // Fetch book info
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`${apiUrl}/books/${bookId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setBook(data.book);
        setAuthor(data.author);
        setRating(data.book.reviews|| 0);
        setGenres(data.genres || []);
        setShelves(data.shelves);
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };

    fetchBook();
    fetchReviews(bookId);
  }, [bookId, navigate]);

  const ReadMore = ({ text, maxLength }) => {
    const [expanded, setExpanded] = useState(false);

    if (text.length <= maxLength) return <span>{text}</span>;

    return (
        <span>
            {expanded ? text : `${text.slice(0, maxLength)}... `}
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setExpanded(!expanded);
                }}
                style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
            >
                {expanded ? "Show less" : "Show more"}
            </a>
        </span>
    );
};

  const handleRatingChange = async (e) => {
    const newRating = parseInt(e.target.value);
    setRating(newRating);

    await fetch(`${apiUrl}/rate-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id: bookId, rating: newRating }),
    });
    alert("Rating updated successfully!");
  };

  const handleShelfChange = async () => {
    if (!selectedShelf) return;

    const res = await fetch(`${apiUrl}/add-to-shelf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id: bookId, shelf_name: selectedShelf }),
    });

    setShelves([...shelves, { shelf_name: selectedShelf }]);
    setSelectedShelf("");
  };

  const handleNewShelf = async () => {
    if (!newShelf) return;

    const res = await fetch(`${apiUrl}/create-shelf-and-add-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id : bookId, shelf_name: newShelf }),
    });

    setShelves([...shelves, { shelf_name: newShelf }]);
    setNewShelf("");
  };

  const fetchReviews = async (bookId) => {
    try {
      const res = await fetch(`${apiUrl}/get-reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ book_id: bookId }),
      });
      const data = await res.json();
      setReviews(data.reviews);
      if (res.status === 200) {
        console.log(data.reviews);
        return data.reviews;
      } else {
        console.error("Error fetching reviews:", data.message);
        return [];
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };
  if (!book) return <div>Loading book details...</div>;

  return (
    <>
        <Navbar />

        <div className="container">
            {/* Book Image and Actions */}
            <div className="book-info">
            <div className="image-section">
                <img src={book.image_link} alt={book.name} className="cover" />
                <button className="button">Read</button>
                <button className="amazon-button">Buy on Amazon</button>
                <div className="rating">{rating.rating || "4.0"} (Rated)</div>
                <div>
                    <label>Rate this book: </label>
                    <select value={rating.rating} onChange={handleRatingChange}>
                        {[1, 2, 3, 4, 5].map((rate) => (
                            <option key={rate} value={rate}>
                                {rate}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Book Details */}
            <div className="details-section">
                <h2>{book.name}</h2>
                <a href={`/authors/${author.author_id}`}><h4>{author.name}</h4></a>
                <p className="description">{book.description}</p>

                <div className="meta-section">
                    <p><strong>Genres:</strong> {
                      genres.length > 0 && 
                      genres.map((genre, idx) => (
                        <a href={`/genre/${genre}`}><span key={idx} className="genre">{genre}, </span></a>
                      ))
                    }</p>
                    <p><strong>Pages:</strong> {book.num_pages} pages</p>
                    <p><strong>Published:</strong> {book.publ_date}</p>
                    <p><strong>ISBN:</strong> {book.isbn}</p>
                    <p><strong>Language:</strong> {book.lang_code}</p>
                </div>

                <h3>📚 Your Shelves</h3>
                {shelves.length > 0 ? (
                    <ul>
                        {shelves.map((shelf, idx) => (
                            <li key={idx}>{shelf.shelf_name}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No shelves found.</p>
                )}

                <div style={{ marginTop: "10px" }}>
                    <label>Add to existing shelf: </label>
                    <select
                        value={selectedShelf}
                        onChange={(e) => setSelectedShelf(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {["Read", "Currently Reading", "Want to Read"].map((shelf) => (
                            <option key={shelf} value={shelf}>
                                {shelf}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleShelfChange}>Add</button>
                </div>

                <div style={{ marginTop: "10px" }}>
                    <label>Create new shelf: </label>
                    <input
                        type="text"
                        value={newShelf}
                        onChange={(e) => setNewShelf(e.target.value)}
                        placeholder="New shelf name"
                    />
                    <button onClick={handleNewShelf}>Create Shelf</button>
                </div>
            </div>
            </div>
            {/* Reviews Section (Moved Below) */}
            <div className="review-section" style={{ marginTop: "40px" }}>
                <h3>📖 Reviews</h3>
                {Reviews && Reviews.length > 0 ? (
                    Reviews.map((review, index) => (
                        <div key={index} className="review-card" style={{ borderBottom: "1px solid #ddd", padding: "15px 0" }}>
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <div style={{ fontWeight: "bold", marginRight: "10px" }}>{review.username}</div>
                                <div style={{ color: "#888", fontSize: "0.9em" }}>
                                    {new Date(review.review_date).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ marginTop: "5px", color: "orange" }}>
                                {"★".repeat(Math.floor(review.rating)) + "☆".repeat(5 - Math.floor(review.rating))}
                            </div>

                            <div style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}>
                                {review.review_text.length > 300 ? (
                                    // <ReadMore text={review.review_text} maxLength={300} />
                                    <></>
                                ) : (
                                    <>{review.review_text}</>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet for this book.</p>
                )}
            </div>
        </div>
    </>
);


};

export default Book;