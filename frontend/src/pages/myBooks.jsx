import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import { Link } from "react-router";
import "../css/myBooks.css";

const Books = () => {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [shelves, setShelves] = useState([]);
  const [totalBooks, setTotalBooks] = useState([]);
  const [showShelfInput, setShowShelfInput] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [customShelves, setCustomShelves] = useState([]); // optional for future display
  const [currentShelf, setCurrentShelf] = useState("All");
  const [showPopup, setShowPopup] = useState(false);
  const [showreviewPopup, setshowreviewPopup] = useState(false);
  const [AllBooks, setAllBooks] = useState([]);
  // const [DateRead, setDateRead] = useState("");
  const [showDateInput, setShowDateInput] = useState({});
  const [currBook, setCurrBook] = useState({});
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [Reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [drafts, setDrafts] = useState([]);
  const [showDraftsPopup, setShowDraftsPopup] = useState(false);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const draftsPerPage = 3;

  const handleEditDraftClick = (draft) => {
    setIsEditingDraft(true);
    setEditingDraft(draft);
    setEditedText(draft.review_text);
  };
  
  const handleSaveEditedDraft = async () => {
    try {
      const response = await fetch(`${apiUrl}/edit-draft`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_id: editingDraft.review_id,
          review_text: editedText,
          rating: editingDraft.rating, // ✅ Add this
        }),
      });
  
      if (response.ok) {
        alert("Draft updated successfully!");
        setIsEditingDraft(false);
        fetchDrafts(); // Refresh list
      } else {
        alert("Failed to update draft");
      }
    } catch (error) {
      console.error("Error updating draft:", error);
      alert("Error updating draft");
    }
  };

  const handleAddReviewClick = async (draft) => {
    try {
      const response = await fetch(`${apiUrl}/add-review-from-drafts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          review_id: draft.review_id,
        }),
      });
  
      if (response.ok) {
        alert("Review added successfully!");
        fetchDrafts(); // Refresh the drafts list
      } else {
        alert("Failed to add review");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      alert("Error adding review");
    }
  };

  const fetchDrafts = async () => {
    try {
      const response = await fetch(`${apiUrl}/list-drafts`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setDrafts(data.drafts || []);
      console.log("Fetched drafts:", data.drafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    }
  };
  

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        if (response.status !== 200) {
          navigate("/login");
        } else {
          console.log("User is logged in");
          fetchBooks();
          fetchAllBooks();
          fetchShelves();
          fetchDrafts();
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  const handleClick = (book, review) => {
    setUserReview(review);
    setReview(review)
    setCurrBook(book);
    setReviewText(review);
    setReviewRating(review?.rating || 1); // default rating
    setshowreviewPopup(true);
  };

  const handleClose = () => {
    setshowreviewPopup(false);
  };

  const handleAddShelf = async () => {
    if (newShelfName.trim() === "") return;

    try {
      const response = await fetch(`${apiUrl}/create-shelf`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shelf_name: newShelfName }),
      });

      if (response.ok) {
        // Optional: Add to a list of custom shelves

        setCustomShelves([...customShelves, { shelf_name: newShelfName }]);
        console.log("Shelf added successfully");
        console.log("shelves", customShelves);
        // Add the new shelf to the shelves state
        setShelves([...shelves, { name: newShelfName }]);

        // Refresh shelves
        // fetchShelves();
      } else {
        console.error("Failed to add new shelf");
      }
    } catch (error) {
      console.error("Error adding new shelf:", error);
    }

    // Rese
    setNewShelfName("");
    setShowShelfInput(false);
  };

  const handleDateAdded = async (bookId, date) => {
    try {
      const response = await fetch(`${apiUrl}/add-date-read`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ book_id: bookId, date_read: date }),
      });
      if (response.ok) {
        console.log(showDateInput);
        // const data = await response.json();
        console.log("Date added successfully");
        setBooks(prevBooks =>
          prevBooks.map(book =>
            book.book_id === bookId ? { ...book, date_read: date } : book
          )
        );
      } else {
        console.error("Failed to sort shelves");
      }
    } catch (error) {
      console.error("Error sorting shelves:", error);
    }
  };

  const handleCompletion = async (bookname, bookauthor)  =>{
    const response = await fetch(`${apiUrl}/send-completion-mail`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name : bookname , author : bookauthor }), // or book info directly
    });
  
    const result = await response.json();
    if (result.success) {
      alert('Email sent successfully!');
    } else {
      alert('Failed to send email.');
    }
  };

  const handleShelfSort = async (shelfName) => {
    try {
      const response = await fetch(`${apiUrl}/sort-shelves`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shelf_name: shelfName }),
      });
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books); // Update the book state with the sorted data
        setCurrentShelf(shelfName); // Update the current shelf
        // settotalBooks(data.book);
      } else {
        console.error("Failed to sort shelves");
      }
    } catch (error) {
      console.error("Error sorting shelves:", error);
    }
  };
  const AddBooktoShelf = async (bookId) => {
    try {
      const response = await fetch(`${apiUrl}/add-to-shelf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ book_id: bookId, shelf_name: currentShelf }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.message === "Already in shelf") {
          alert("Book is already in the selected shelf.");
        } else {
          alert("Book added to shelf successfully!");

          // Update the AllBooks state
          setAllBooks((prevBooks) => [
            ...prevBooks,
            { ...totalBooks.find((book) => book.book_id === bookId), shelf_name: currentShelf },
          ]);
          // console.log("AllBooks", AllBooks);
          // Update the totalBooks state for specific shelves
          if (["Currently Reading", "Want to Read", "Read"].includes(currentShelf)) {
            setTotalBooks((prevBooks) =>
              prevBooks.map((book) =>
                book.book_id === bookId ? { ...book, shelf_name: currentShelf } : book
              )
            );
          }

          // Close the popup
          // setShowPopup(false);
        }
      } else {
        console.error("Failed to add book to shelf:", data.message);
        alert("Failed to add book to shelf.");
      }
    } catch (error) {
      console.error("Error adding book to shelf:", error);
      alert("An error occurred while adding the book to the shelf.");
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${apiUrl}/list-books`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched books:", data.books);
      setBooks(data.books);
      setTotalBooks(data.books || []);
      console.log(data.books);
    } catch (error) {
      console.error("Error fetching book:", error);
    }
  };

  const fetchAllBooks = async () => {
    try {
      const response = await fetch(`${apiUrl}/list-all-books`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      console.log("Fetched books:", data.books);
      setAllBooks(data.books);
      console.log(data.books);
    } catch (error) {
      console.error("Error fetching book:", error);
    }
  };


  const fetchShelves = async () => {
    try {
      const res = await fetch(`${apiUrl}/shelves`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setShelves(data.shelves || []);
      setCustomShelves(data.shelves || []);
      console.log("Fetched shelves:", data.shelves);
      // setTotalBooks(data.total || 0);
    } catch (error) {
      console.error("Error fetching shelves:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") {
      setBooks(totalBooks);
    } else {
      const filtered = totalBooks.filter(book =>
        book.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBooks(filtered);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="mybooks-container">
        {/* Sidebar */}
        <div className="sidebar">
          <h2>Bookshelves</h2>
          <div className="shelves-list">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleShelfSort("All");
              }}
              className={`shelf-link ${currentShelf === "All" ? "active" : ""}`}
            >
              All <span className="shelf-count">{totalBooks.length}</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleShelfSort("Read");
              }}
              className={`shelf-link ${currentShelf === "Read" ? "active" : ""}`}
            >
              Read <span className="shelf-count">{totalBooks.filter((book) => book.shelf_name === "Read").length}</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleShelfSort("Currently Reading");
              }}
              className={`shelf-link ${currentShelf === "Currently Reading" ? "active" : ""}`}
            >
              Currently Reading <span className="shelf-count">{totalBooks.filter((book) => book.shelf_name === "Currently Reading").length}</span>
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleShelfSort("Want to Read");
              }}
              className={`shelf-link ${currentShelf === "Want to Read" ? "active" : ""}`}
            >
              Want to Read <span className="shelf-count">{totalBooks.filter((book) => book.shelf_name === "Want to Read").length}</span>
            </a>
            {customShelves
              .filter((shelf) => shelf.shelf_name !== "All")
              .map((shelf, index) => (
                <a
                  key={index}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShelfSort(shelf.shelf_name);
                  }}
                  className={`shelf-link ${currentShelf === shelf.shelf_name ? "active" : ""}`}
                >
                  {shelf.shelf_name} <span className="shelf-count">{AllBooks.filter((book) => book.shelf_name === shelf.shelf_name).length}</span>
                </a>
              ))}
          </div>

          {!showShelfInput ? (
            <button className="add-shelf-button" onClick={() => setShowShelfInput(true)}>
              Add shelf
            </button>
          ) : (
            <div className="shelf-input-group">
              <input
                type="text"
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                className="shelf-input"
                placeholder="Enter shelf name"
              />
              <button className="add-shelf-button" onClick={handleAddShelf}>
                Add
              </button>
            </div>
          )}

          <h4>Your reading activity</h4>
          <ul className="shelves-list">
            <li>
              <a href="#" className="shelf-link" onClick={(e) => {
                e.preventDefault();
                setShowDraftsPopup(true);
              }}>
                Review Drafts
              </a>
            </li>
            <li><Link to="#" className="shelf-link">Reading Challenge</Link></li>
            <li><Link to="/year-in-books" className="shelf-link">Year in Books</Link></li>
            <li><Link to="#" className="shelf-link">Reading stats</Link></li>
          </ul>

          <h4>Tools</h4>
          <ul className="shelves-list">
            <li><Link to="#" className="shelf-link">Find duplicates</Link></li>
            <li><Link to="#" className="shelf-link">Widgets</Link></li>
            <li><Link to="#" className="shelf-link">Import and export</Link></li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="page-header">
            <h1 className="page-title">Book Shelf: {currentShelf}</h1>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search by book name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">Search</button>
            </form>
          </div>

          <table className="books-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Average Rating</th>
                <th>Rating</th>
                <th>Shelves</th>
                <th>Review</th>
                <th>Date Read</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {books.sort((a, b) => a.book_id - b.book_id).map(book => (
                <tr key={book.book_id}>
                  <td>
                    <img src={book.image_link} alt={book.name} className="book-cover" />
                  </td>
                  <td>
                    <Link to={`/books/${book.book_id}`} className="book-link">
                      {book.name}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/authors/${book.author_id}`} className="book-link">
                      {book.author_name}
                    </Link>
                  </td>
                  <td>{book.avg_rating}</td>
                  <td>{book.rating}</td>
                  <td>
                    {[
                      ...new Set([
                        book.shelf_name,
                        ...(Array.isArray(AllBooks)
                          ? AllBooks
                            .filter(allbook => allbook.name === book.name)
                            .map(b => b.shelf_name)
                          : [])
                      ])
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not Assigned"}
                  </td>
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(book, book.review);
                      }}
                      className="book-link"
                    >
                      {book.review ? "edit review" : "write review"}
                    </a>
                  </td>
                  <td>
                    <div className="date-cell">
                      <span className="date-text">
                        {book.date_read ? new Date(book.date_read).toLocaleDateString() : '—'}
                      </span>
                      <button
                        className="date-button"
                        onClick={() =>
                          setShowDateInput((prev) => ({
                            ...prev,
                            [book.book_id]: true
                          }))
                        }
                      >
                        Add Date
                      </button>
                      {showDateInput?.[book.book_id] && (
                        <input
                          type="date"
                          className="date-input"
                          onChange={(e) => {
                            handleDateAdded(book.book_id, e.target.value);
                            handleCompletion(book.name, book.author_name);
                          }}
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    {book.date_added ? new Date(book.date_added).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentShelf !== "All" && (
            <button
              className="add-book-button"
              onClick={() => setShowPopup(true)}
            >
              Add Book
            </button>
          )}

          {showPopup && (
            <div className="book-modal">
              <div className="modal-header">
                <h2>Select a Book</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowPopup(false)}
                >
                  ×
                </button>
              </div>
              <div className="books-grid">
                {totalBooks.map((book) => (
                  <div
                    key={book.book_id}
                    className="book-card"
                    onClick={() => AddBooktoShelf(book.book_id)}
                  >
                    <img
                      src={book.image_link}
                      alt={book.name}
                    />
                    <div className="book-card-info">
                      <h3 className="book-card-title">{book.name}</h3>
                      <p className="book-card-author">{book.author_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showreviewPopup && (
            <div className="review-modal">
              <div className="modal-header">
                <h3>{currBook.review ? "Edit Review" : "Write Review"}</h3>
                <button className="modal-close" onClick={handleClose}>×</button>
              </div>
              <form className="review-form">
                <label>Your Rating:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <textarea
                  className="review-textarea"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review..."
                />

                <div className="review-actions">
                  <button
                    className="review-submit"
                    onClick={async (e) => {
                      e.preventDefault();
                      const endpoint = userReview ? "/edit-review" : "/add-review";
                      const res = await fetch(`${apiUrl}${endpoint}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                          book_id: currBook.book_id,
                          review_text: reviewText,
                          rating: reviewRating,
                        }),
                      });

                      if (res.status === 200) {
                        alert(userReview ? "Review updated!" : "Review added!");
                        fetchBooks();
                        fetchAllBooks();
                        fetchShelves();
                        setshowreviewPopup(false);
                      } else {
                        alert("Error submitting review.");
                      }
                    }}
                  >
                    {review ? "Update Review" : "Submit Review"}
                  </button>
                  <button className="review-cancel" onClick={handleClose}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          {showDraftsPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="drafts-header">
                  <h3>Your Draft Reviews</h3>
                  <button
                    onClick={() => setShowDraftsPopup(false)}
                    className="close-popup-button"
                  >
                    Close
                  </button>
                </div>
                {drafts.length === 0 ? (
                  <div className="no-drafts-message">
                    <p>No drafts saved yet</p>
                  </div>
                ) : (
                  <div className="drafts-container">
                    {drafts
                      .slice((currentPage - 1) * draftsPerPage, currentPage * draftsPerPage)
                      .map((draft) => (
                        editingDraft && isEditingDraft && editingDraft.review_id === draft.review_id ? (
                          <div key={draft.review_id} className="draft-page">
                            <div className="edit-draft-form">
                              <h4>Editing Review for: {editingDraft.book_name}</h4>
                              <textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="draft-edit-textarea"
                              />
                              <div className="draft-edit-actions">
                                <button
                                  onClick={handleSaveEditedDraft}
                                  className="save-draft-button"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setIsEditingDraft(false)}
                                  className="cancel-draft-button"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div key={draft.review_id} className="draft-page">
                            <div className="draft-page-header">
                              <h4>{draft.book_name}</h4>
                              <div className="draft-rating">
                                {"★".repeat(draft.rating) + "☆".repeat(5 - draft.rating)}
                              </div>
                            </div>
                            <div className="draft-page-content">
                              <p>{draft.review_text}</p>
                            </div>
                            <div className="draft-page-footer">
                              <button
                                onClick={() => handleEditDraftClick(draft)}
                                className="edit-draft-button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleAddReviewClick(draft)}
                                className="add-review-button"
                              >
                                Add Review
                              </button>
                            </div>
                          </div>
                        )
                      ))}
                    {drafts.length > draftsPerPage && (
                      <div className="drafts-pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-button"
                        >
                          Previous
                        </button>
                        <span className="pagination-info">
                          Page {currentPage} of {Math.ceil(drafts.length / draftsPerPage)}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === Math.ceil(drafts.length / draftsPerPage)}
                          className="pagination-button"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Books;
