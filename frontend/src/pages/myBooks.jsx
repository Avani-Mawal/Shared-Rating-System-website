import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import { Link } from "react-router";
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
          // fetchShelves();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);
  
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
        setCustomShelves([...customShelves, { name: newShelfName }]);

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
  
      await fetch(`${apiUrl}/add-to-shelf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ book_id: bookId, shelf_name: currentShelf }),
      });

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

  // const fetchShelves = async () => {
  //   try {
  //     const res = await fetch(`${apiUrl}/user/shelves`, {
  //       method: "GET",
  //       credentials: "include",
  //     });
  //     const data = await res.json();
  //     setShelves(data.shelves || []);
  //     setTotalBooks(data.total || 0);
  //   } catch (error) {
  //     console.error("Error fetching shelves:", error);
  //   }
  // };

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

  return (
    <>
      <Navbar />
      
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        
        <div style={{ width: "250px", padding: "20px", borderRight: "1px solid #ccc" }}>
        <div style={{ marginBottom: "20px" }}>
        <h2>Bookshelves (Edit)</h2>
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
          {customShelves.map((shelf, index) => (
                <div key={index}>
                  <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleShelfSort(shelf);
                  }}
                  style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                  >
                  {shelf} (
                  {
                    totalBooks.filter((book) => book.shelf_name === shelf).length
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
                    Author ID: {book.author_id}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: "20px" }}>
          <h1>book List</h1>
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
                <th style={thStyle}>book Name</th>
                <th style={thStyle}>Author ID</th>
                <th style={thStyle}>Average Rating</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Shelves</th>
                <th style={thStyle}>Date Read</th>
                <th style={thStyle}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {books.sort((a, b) => a.book_id - b.book_id).map(book => (
                <tr key={book.book_id}>
                  <td style={tdStyle}>
                    <img src={book.image_link} alt={book.name} width="50" />
                  </td>
                  <td style={{ border: "1px solid black", padding: "8px" }}>
                    <Link to={`/books/${book.book_id}`} style={{ color: "blue", textDecoration: "underline" }}>
                      {book.name}
                    </Link>
                  </td>
                  <td style={tdStyle}>{book.author_id}</td>
                  <td style={tdStyle}>{book.avg_rating}</td>
                  <td style={tdStyle}>{book.rating}</td>
                  <td style={tdStyle}>{book.shelf_name}</td>
                  <td style={tdStyle}>
                    {book.date_read ? new Date(book.date_read).toLocaleDateString() : '—'}
                  </td>
                  <td style={tdStyle}>
                    {book.date_added ? new Date(book.date_added).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const thStyle = { border: "1px solid black", padding: "8px", backgroundColor: "#f2f2f2" };
const tdStyle = { border: "1px solid black", padding: "8px" };

export default Books;
