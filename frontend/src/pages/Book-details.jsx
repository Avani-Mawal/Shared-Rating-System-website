import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

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
        setRating(data.book.rating || 0);
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

    await fetch(`${apiUrl}/add-to-shelf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ book_id: bookId, shelf_name: selectedShelf }),
    });

    setShelves([...shelves, selectedShelf]);
    setSelectedShelf("");
  };

  const handleNewShelf = async () => {
    if (!newShelf) return;

    await fetch(`${apiUrl}/create-shelf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ shelf_name: newShelf }),
    });

    setShelves([...shelves, newShelf]);
    setNewShelf("");
  };

  if (!book) return <div>Loading book details...</div>;

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h1>{book.name}</h1>
        <img src={book.image_link} alt={book.name} width="150" />
        <p><strong>Author ID:</strong> {book.author_id}</p>
        <p><strong>Average Rating:</strong> {book.avg_rating}</p>
        <p><strong>Your Rating:</strong>
          <select value={rating} onChange={handleRatingChange}>
            <option value="0">Rate this book</option>
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </p>

        <h3>📚 Your Shelves</h3>
        <ul>
          {shelves.map((shelf, idx) => (
            <li key={idx}>{shelf.shelf_name}</li>
          ))}
        </ul>

        <div style={{ marginTop: "10px" }}>
          <label>Add to existing shelf: </label>
          <select
            value={selectedShelf}
            onChange={(e) => setSelectedShelf(e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="Read">Read</option>
            <option value="Currently Reading">Currently Reading</option>
            <option value="Want to Read">Want to Read</option>
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
    </>
  );
};

export default Book;
