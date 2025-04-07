import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
// import { Link } from "react-router";
import "../css/Book-details.css";

const Book = () => {
  const { bookId } = useParams(); // assuming the URL is like /books/:bookId
  const [book, setBook] = useState(null);
  const [shelves, setShelves] = useState([]);
  const [rating, setRating] = useState(0);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [newShelf, setNewShelf] = useState("");

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
        setRating(data.book.reviews|| 0);
        setShelves(data.shelves);
      } catch (error) {
        console.error("Error fetching book:", error);
      }
    };

    fetchBook();

  }, [bookId]);

  const handleRatingChange = async (e) => {
    const newRating = parseInt(e.target.value);
    setRating(newRating);

    await fetch(`${apiUrl}/rate-book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id: bookId, rating: newRating }),
    });
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

  if (!book) return <div>Loading book details...</div>;

return (
    <>
        <Navbar />
        <div className="container">
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

            <div className="details-section">
                <h2>{book.name}</h2>
                <h4>{book.author_id}</h4>
                <p className="description">{book.description}</p>

                <div className="meta-section">
                    <p><strong>Genres:</strong> {book.genres?.join(", ")}</p>
                    <p><strong>Pages:</strong> {book.pnum_ages} pages</p>
                    <p><strong>Published:</strong> {book.publ_date}</p>
                    <p><strong>ISBN:</strong> {book.isbn}</p>
                    <p><strong>Language:</strong> {book.lang_code}</p>
                    <p><strong>Characters:</strong> {book.characters?.join(", ")}</p>
                </div>

                <h3>📚 Your Shelves</h3>
               
                { shelves.length > 0 ? (
                <ul>
                    {shelves.map((shelf, idx) => (
                      console.log(shelf),
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
    </>
);
};

export default Book;