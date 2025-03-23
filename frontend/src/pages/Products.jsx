import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";

const Products = () => {
  const navigate = useNavigate(); // Use this to redirect users

  // TODO: Implement the checkStatus function.
  // This function should check if the user is logged in.
  // If not logged in, redirect to the login page.
  // if logged in, fetch the products
  useEffect(() => {
    const checkStatus = async () => {
      // Implement API call here to check login status
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        if (response.status !== 200) {
          navigate("/login");
        } else {
          fetchProducts();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // Read about useState to understand how to manage component state
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [originalProducts, setOriginalProducts] = useState([]);

  // NOTE: You are free to add more states and/or handler functions
  // to implement the features that are required for this assignment

  // TODO: Fetch products from the APIx
  // This function should send a GET request to fetch products
  const fetchProducts = async () => {
    // Implement the API call here to fetch product data
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
  
  // TODO: Implement the product quantity change function
  // If the user clicks on plus (+), then increase the quantity by 1
  // If the user clicks on minus (-), then decrease the quantity by 1
  const handleQuantityChange = (productId, change) => {
  //  console.log("change", change);
  //  alert( change);
    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [productId]: Math.max(0, (prevQuantities[productId] || 0) + change)
    }));
  }

  // TODO: Add the product with the given productId to the cart
  // the quantity of this product can be accessed by using a state
  // use the API you implemented earlier
  // display appropriate error messages if any
  const addToCart = async (productId) => {
    const quantity = quantities[productId] || 0;
    const product = products.find(p => p.product_id === productId);

    if (quantity > product.stock_quantity) {
      alert("Requested quantity exceeds stock available.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: Number(productId), quantity }), // Ensure productId is a number
        credentials: "include"
      });
      const data = await response.json();
      if (response.status === 200) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  }

  // TODO: Implement the search functionality
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") {
      setProducts(originalProducts); // Reset to original products if search term is empty
    } else {
      const filteredProducts = originalProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setProducts(filteredProducts);
    }
  };


  // TODO: Display products with a table
  // Display each product's details, such as ID, name, price, stock, etc.
  return (
    <>
      <Navbar />
      <div>
        <h1>Product List</h1>
        {/* Implement the search form */}
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Stock Available</th>
            </tr>
          </thead>
          <tbody>
          {products.sort((a, b) => a.id - b.id).map(product => (
              <tr key={product.product_id}>
                <td>{product.product_id}</td>
                <td>{product.name}</td>
                <td>{product.price}</td>
                <td>{product.stock_quantity}</td>
                <td>
                  <button onClick={() => handleQuantityChange(product.product_id, -1)}>-</button>
                  {quantities[product.product_id] || 0}
                  <button onClick={() => handleQuantityChange(product.product_id, 1)}>+</button>
                </td>
                <td>
                  <button onClick={() => addToCart(product.product_id)}>Add to Cart</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Products;
