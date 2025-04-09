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
          console.log("AllBooks", AllBooks);
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />

      <div style={{ display: "flex" }}>
        {/* Sidebar */}

        <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #ccc" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2>Bookshelves</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShelfSort("All");
                  }}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                >
                  All ({totalBooks.length})
                </a>
              </div>
              <div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShelfSort("Read");
                  }}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                >
                  Read (
                  {

                    totalBooks.filter((book) => book.shelf_name === "Read").length
                  }
                  )
                </a>

              </div>
              <div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShelfSort("Currently Reading");
                  }}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                >
                  Currently Reading (
                  {
                    totalBooks.filter((book) => book.shelf_name === "Currently Reading").length
                  }
                  )
                </a>


              </div>
              <div>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShelfSort("Want to Read");
                  }}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                >
                  Want to Read (
                  {
                    totalBooks.filter((book) => book.shelf_name === "Want to Read").length
                  }
                </a>

                )
              </div>
              {customShelves
                .filter((shelf) => shelf.shelf_name !== "All") // Skip "All" shelf
                .map((shelf, index) => (
                  <div key={index}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShelfSort(shelf.shelf_name);
                      }}
                      style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                    >
                      {shelf.shelf_name} (
                      {
                        AllBooks.filter(
                          (book) => book.shelf_name === shelf.shelf_name
                        ).length
                      }
                      )
                    </a>
                  </div>
                ))}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>

                {!showShelfInput && (
                  <button
                    onClick={() => setShowShelfInput(true)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Add shelf
                  </button>
                )}

                {showShelfInput && (
                  <div>
                    <label style={{ marginRight: "8px" }}><b>Add a Shelf:</b></label>
                    <input
                      type="text"
                      value={newShelfName}
                      onChange={(e) => setNewShelfName(e.target.value)}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        marginRight: "6px"
                      }}
                    />
                    <button
                      onClick={handleAddShelf}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#eee",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer"
                      }}
                    >
                      add
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          <hr />
          <h4>Your reading activity</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>Review Drafts</li>
            <li>Reading Challenge</li>
            <li>Year in Books</li>
            <li>Reading stats</li>
          </ul>

          <hr />
          <h4>Tools</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>Find duplicates</li>
            <li>Widgets</li>
            <li>Import and export</li>
          </ul>
        </div>
        <div style={{ position: "fixed", bottom: "20px", right: "20px" }}>
          {currentShelf !== "All" && (
            <button
              onClick={() => setShowPopup(true)}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)"
              }}
            >
              Add Book
            </button>
          )}
          {showPopup && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h2>Select a Book</h2>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  padding: "5px 10px",
                }}
              >
                Close
              </button>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {totalBooks.map((book) => (
                  <div
                    key={book.book_id}
                    style={{
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                      textAlign: "center",
                      width: "150px",
                    }}
                  >
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        AddBooktoShelf(book.book_id);
                      }}
                    >
                      <img
                        src={book.image_link}
                        alt={book.name}
                        style={{ width: "100px", height: "150px", objectFit: "cover" }}
                      />
                    </a>
                    <p style={{ margin: "10px 0 5px", fontWeight: "bold" }}>{book.name}</p>
                    <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
                      Author: {book.author_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: "20px" }}>
          <h1>Book Shelf : {currentShelf}</h1>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by book name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <table style={{ border: "1px solid black", borderCollapse: "collapse", width: "100%", marginTop: "20px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Book Title</th>
                <th style={thStyle}>Author</th>
                <th style={thStyle}>Average Rating</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Shelves</th>
                <th style={thStyle}>Review</th>
                <th style={thStyle}>Date Read</th>
                <th style={thStyle}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {books.sort((a, b) => a.book_id - b.book_id).map(book => (
                <React.Fragment key={book.bookId}>
                  <tr key={book.book_id}>
                    <td style={tdStyle}>
                      <img src={book.image_link} alt={book.name} width="50" />
                    </td>
                    <td style={{ border: "1px solid black", padding: "8px" }}>
                      <Link to={`/books/${book.book_id}`} style={{ color: "blue", textDecoration: "underline" }}>
                        {book.name}
                      </Link>
                    </td>

                    <td style={tdStyle}>
                      <Link to={`/authors/${book.author_id}`} style={{ color: "blue", textDecoration: "underline" }}>
                        {book.author_name}
                      </Link>
                    </td>
                    <td style={tdStyle}>{book.avg_rating}</td>
                    <td style={tdStyle}>{book.rating}</td>
                    {/* <td style={tdStyle}>{book.shelf_name}</td> */}
                    <td style={tdStyle}>
                      {
                        [
                          ...new Set([
                            book.shelf_name,
                            ...(Array.isArray(AllBooks)
                              ? AllBooks
                                .filter(allbook => allbook.name === book.name)
                                .map(b => b.shelf_name)
                              : [])
                          ])
                        ]
                          .filter(Boolean) // removes undefined, null, empty strings
                          .join(", ") || "Not Assigned"
                      }
                    </td>

                    <td style={tdStyle}>
                      <a
                        href="#"
                        onClick={(e) => {
                          // e.preventDefault(); // Prevent page jump
                          handleClick(book, book.review);
                        }}
                        style={{ color: "blue", textDecoration: "underline" }}
                      >
                        {book.review ? "edit review" : "write review"}
                      </a>
                    </td>



                    <td style={tdStyle}>
                      {book.date_read ? new Date(book.date_read).toLocaleDateString() : '—'}

                      <button
                        style={{
                          marginLeft: "10px",
                          padding: "2px 6px",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                        onClick={() =>
                          setShowDateInput((prev) => ({
                            ...prev,
                            [book.book_id]: true
                          }))
                        }
                      >
                        Add Date
                      </button>

                      {/* This input appears ONLY for the row where book.id matches */}
                      {showDateInput?.[book.book_id] && (
                        <input
                          type="date"
                          style={{ marginLeft: "10px" }}
                          onChange={(e) => handleDateAdded(book.book_id, e.target.value)}
                        />
                      )}
                    </td>
                    <td style={tdStyle}>
                      {book.date_added ? new Date(book.date_added).toLocaleDateString() : '—'}
                    </td>
                  </tr>

                </React.Fragment>
              ))}
            </tbody>
          </table>

          {showreviewPopup && (

            <div className="popup-overlay">
              <div className="popup-content">
                <h3>{currBook.review ? "Edit Review" : "Write Review"}</h3>

                <label style={{ display: "block", marginBottom: "5px" }}>Your Rating:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  style={{ marginBottom: "10px" }}
                >
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows="5"
                  cols="40"
                  style={{ resize: "none" }}
                />

                <div style={{ marginTop: "10px" }}>
                  <button onClick={async () => {
                    console.log("handle submit me calle", userReview);
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
                  }
                  }>
                    {review ? "Update Review" : "Submit Review"}
                  </button>
                  <button onClick={handleClose} style={{ marginLeft: "10px" }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>

          )}


        </div>
      </div>
    </>
  );
};

const thStyle = { border: "1px solid black", padding: "8px", backgroundColor: "#f2f2f2" };
const tdStyle = { border: "1px solid black", padding: "8px" };

export default Books;
