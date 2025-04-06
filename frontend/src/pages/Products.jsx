import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Products = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [originalProducts, setOriginalProducts] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [showShelfInput, setShowShelfInput] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [customShelves, setCustomShelves] = useState([]); // optional for future display
  
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
          fetchProducts();
          fetchShelves();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);
  
  const handleAddShelf = () => {
    if (newShelfName.trim() === "") return;
  
    // Optional: Add to a list of custom shelves
    setCustomShelves([...customShelves, newShelfName]);
  
    // Reset
    setNewShelfName("");
    setShowShelfInput(false);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/list-products`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setProducts(data.products);
      setOriginalProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchShelves = async () => {
    try {
      const res = await fetch(`${apiUrl}/user/shelves`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setShelves(data.shelves || []);
      setTotalBooks(data.total || 0);
    } catch (error) {
      console.error("Error fetching shelves:", error);
    }
  };

  const handleQuantityChange = (productId, change) => {
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: Math.max(0, (prevQuantities[productId] || 0) + change)
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") {
      setProducts(originalProducts);
    } else {
      const filtered = originalProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filtered);
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
          <div>All ({originalProducts.length})</div>
          <div>
            Read (
            {
              originalProducts.filter((product) => product.shelf_name === "Read").length
            }
            )
          </div>
          <div>
            Currently Reading (
            {
              originalProducts.filter((product) => product.shelf_name === "Currently Reading").length
            }
            )
          </div>
          <div>
            Want to Read (
            {
              originalProducts.filter((product) => product.shelf_name === "Want to Read").length
            }
            )
          </div>
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

        {/* Main Content */}
        <div style={{ flexGrow: 1, padding: "20px" }}>
          <h1>Product List</h1>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>

          <table style={{ border: "1px solid black", borderCollapse: "collapse", width: "100%", marginTop: "20px" }}>
            <thead>
              <tr>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Product Name</th>
                <th style={thStyle}>Author ID</th>
                <th style={thStyle}>Average Rating</th>
                <th style={thStyle}>Rating</th>
                <th style={thStyle}>Shelves</th>
                <th style={thStyle}>Date Read</th>
                <th style={thStyle}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {products.sort((a, b) => a.book_id - b.book_id).map(product => (
                <tr key={product.book_id}>
                  <td style={tdStyle}>
                    <img src={product.image_link} alt={product.name} width="50" />
                  </td>
                  <td style={tdStyle}>{product.name}</td>
                  <td style={tdStyle}>{product.author_id}</td>
                  <td style={tdStyle}>{product.avg_rating}</td>
                  <td style={tdStyle}>{product.rating}</td>
                  <td style={tdStyle}>{product.shelf_name}</td>
                  <td style={tdStyle}>
                    {product.date_read ? new Date(product.date_read).toLocaleDateString() : '—'}
                  </td>
                  <td style={tdStyle}>
                    {product.date_added ? new Date(product.date_added).toLocaleDateString() : '—'}
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

export default Products;
