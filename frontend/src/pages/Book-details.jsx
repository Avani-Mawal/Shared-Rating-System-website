import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
// import { Link } from "react-router";
import "../css/Book-details.css";

const Book = () => {
  const navigate = useNavigate();
  const { bookId } = useParams(); // assuming the URL is like /books/:bookId
  const [book, setBook] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [newShelf, setNewShelf] = useState("");
  const [Reviews, setReviews] = useState([]);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [genres, setGenres] = useState([]);
  const [author, setAuthor] = useState("");
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [totalshelves, setTotalShelves] = useState([]);
  // Fetch book info

  const onStarClick = (star) => {
    setRating(star);
    handleRatingChange(star); // pass just the number, not a fake event
  };

  // Check login status
  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/isLoggedIn`, {
        credentials: "include",
      });
      if (response.status !== 200) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`${apiUrl}/books/${bookId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        // console.log(data.book);
        setBook(data.book);
        setAuthor(data.author);
        setRating(data.book.reviews || 0);
        setGenres(data.genres || []);
        setShelves(data.shelves);

      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };
    checkLoginStatus();
    fetchBook();
    fetchShelves();
    fetchReviews(bookId);
  }, [bookId, navigate]);

  //   const ReadMore = ({ text, maxLength }) => {
  //     const [expanded, setExpanded] = useState(false);

  //     if (text.length <= maxLength) return <span>{text}</span>;

  //     return (
  //         <span>
  //             {expanded ? text : `${text.slice(0, maxLength)}... `}
  //             <a
  //                 href="#"
  //                 onClick={(e) => {
  //                     e.preventDefault();
  //                     setExpanded(!expanded);
  //                 }}
  //                 style={{ color: "blue", cursor: "pointer", textDecoration: "underline" }}
  //             >
  //                 {expanded ? "Show less" : "Show more"}
  //             </a>
  //         </span>
  //     );
  // };

  const fetchShelves = async () => {
    try {
      const response = await fetch(`${apiUrl}/get-shelves`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setTotalShelves(data.shelves);
        console.log("Fetched shelves:", data.shelves);
      } else {
        console.error("Failed to fetch shelves");
      }
    } catch (error) {
      console.error("Error fetching shelves:", error);
    }
  };

  const handleRatingChange = async (newRating) => {
    setRating(newRating);
    console.log("bookid", bookId);
    console.log("rating", newRating);

    try {
      const response = await fetch(`${apiUrl}/add-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookId: bookId, rating: newRating }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);

      } else {
        console.error("Failed to update rating");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  const handleShelfChange = async () => {
    if (!selectedShelf) return;

    const res = await fetch(`${apiUrl}/add-to-shelf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id: bookId, shelf_name: selectedShelf }),
    });
    if (["Currently Reading", "Read", "Want to Read"].includes(selectedShelf)) {
      console.log("checking");
      setShelves(
        shelves.map((shelf) =>
          shelf.shelf_name === selectedShelf
            ? { ...shelf, book_ids: [...(shelf.book_ids || []), bookId] }
            : shelf
        )
      );
    } else {
      setShelves([...shelves, { shelf_name: selectedShelf }]);
      console.log(shelves);
    }
    setSelectedShelf("");
  };

  const handleNewShelf = async () => {
    if (!newShelf) return;

    const res = await fetch(`${apiUrl}/create-shelf-and-add-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id: bookId, shelf_name: newShelf }),
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
        // console.log(data.reviews);
        setUserReview(data.userReview);
        setReviewText(data.userReview ? data.userReview : "");
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
  const currentRating = rating;
  return (
    <>
      <Navbar />

      <div className="container">
        <div className="book-info">
          <div className="image-section">
            <img src={book.image_link} alt={book.name} className="cover" />
            <button
              className="amazon-button"
              onClick={() => window.open(book.amazon_link, "_blank")}
            >
              Buy on Amazon
            </button>
            {/* <div className="rating">{rating.rating || "4.0"} (Rated)</div>
                        <div>
                          <label>Rate this book: </label>
                          <select value={rating.rating} onChange={handleRatingChange}>
                            {[1, 2, 3, 4, 5].map((rate) => (
                              <option key={rate} value={rate}>
                                {rate}
                              </option>
                            ))}
                          </select>
                        </div> */}

          </div>
          <div>
            <label>Rate this book: </label>
            <div style={{ display: "inline-flex", cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => onStarClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  style={{
                    fontSize: "24px",
                    color: star <= (hoveredRating || currentRating) ? "#FFD700" : "#ccc",
                    transition: "color 0.2s"
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>


          {/* Book Details */}
          <div className="details-section">
            <h2>{book.name}</h2>
            <a href={`/authors/${author.author_id}`}><h4>{book.author_name}</h4></a>
            <p className="description">{book.description}</p>

            <div className="meta-section">
              <p><strong>Genres:</strong> {
                genres.length > 0 &&
                genres.map((genre, idx) => (
                  <a key={idx} href={`/genre/${genre}`}><span key={idx} className="genre">{genre}, </span></a>
                ))
              }</p>
              <p><strong>Pages:</strong> {book.num_pages} pages</p>
              <p><strong>Published:</strong> {book.publ_date}</p>
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Language:</strong> {book.lang_code}</p>
            </div>

            <h3>📚 Your Shelves</h3>
            {[...new Set(shelves.map(s => s.shelf_name))].length > 0 ? (
              <ul>
                {[...new Set(shelves.map(s => s.shelf_name))].map((name, idx) => (
                  <li key={idx}>{name}</li>
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
                {[
                  ...new Set([
                    ...totalshelves,
                    "Currently Reading",
                    "Want to Read",
                    "Read"
                  ])
                ]
                  .filter(name => name !== "All")
                  .map((shelfName) => (
                    <option key={shelfName} value={shelfName}>
                      {shelfName}
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
        <div className="review-section" style={{ marginTop: "40px"}}>
          <h3>📖 Reviews</h3>
          {isLoggedIn ? <div className="review-form" style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
            <h3>{userReview ? "✏️ Edit Your Review" : "📝 Write a Review"}</h3>

            <label style={{ display: "block", marginBottom: "5px" }}>Your Rating: </label>
            <select
              value={reviewRating}
              onChange={(e) => setReviewRating(parseInt(e.target.value))}
              style={{ marginBottom: "10px" }}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <br />
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your thoughts..."
              rows={5}
              style={{ width: "100%", marginBottom: "10px" }}
            />

            <br />
            <button onClick={async () => {
              const endpoint = userReview ? "/edit-review" : "/add-review";
              const res = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  book_id: bookId,
                  review_text: reviewText,
                  rating: reviewRating
                }),
              });

              if (res.status === 200) {
                alert(userReview ? "Review updated!" : "Review added!");
                fetchReviews(bookId); // refresh the reviews list
              } else {
                alert("Error submitting review.");
              }
            }}>
              {userReview ? "Update Review" : "Submit Review"}
            </button>
          </div>
            :
            <div>
              <p> Login to give ratings and reviews </p>
              <button onClick={() => navigate("/login")} style={{ background: "blue", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px" }} > Login! </button>
            </div>
          }


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
                  {review.review_text}
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