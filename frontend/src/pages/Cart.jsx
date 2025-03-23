import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import { apiUrl } from "../config/config";
import "../css/Cart.css";

const Cart = () => {
  // TODO: Implement the checkStatus function
  // If the user is already logged in, fetch the cart.
  // If not, redirect to the login page.
  
    const navigate = useNavigate(); // Use this to redirect users
  
    const [cart, setCart] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [address, setAddress] = useState({
      pincode: "",
      street: "",
      city: "",
      state: ""
    });
  useEffect(() => {
    const checkStatus = async () => {
      // Implement your logic to check if the user is logged in
      // If logged in, fetch the cart data, otherwise navigate to /login
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.status !== 200) {
          navigate("/login");
        } else {
          fetchCart();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // TODO: Manage cart state with useState
  // cart: Stores the items in the cart
  // totalPrice: Stores the total price of all cart items
  // error: Stores any error messages (if any)
  // message: Stores success or info messages
  

  // TODO: Implement the fetchCart function
  // This function should fetch the user's cart data and update the state variables
  const fetchCart = async () => {
    // Implement your logic to fetch the cart data
    // Use the API endpoint to get the user's cart
    try {
      const response = await fetch(`${apiUrl}/display-cart`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setCart(data.cart);
      setTotalPrice(data.totalPrice);
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  // TODO: Implement the updateQuantity function
  // This function should handle increasing or decreasing item quantities
  // based on user input. Make sure it doesn't exceed stock limits.
  const updateQuantity = async (productId, change, currentQuantity, stockQuantity) => {
    // Implement your logic for quantity update
    // Validate quantity bounds and update the cart via API
  
    try {
      const response = await fetch(`${apiUrl}/update-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity: change }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) {
        setMessage("Cart updated successfully");
        fetchCart();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Errorsss updating cart:", error);
    }
  };

  // TODO: Implement the removeFromCart function
  // This function should remove an item from the cart when the "Remove" button is clicked
  const removeFromCart = async (productId) => {
    // Implement your logic to remove an item from the cart
    // Use the appropriate API call to handle this
    try {
      const response = await fetch(`${apiUrl}/remove-from-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) {
        setMessage("Item removed from cart");
        fetchCart();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // TODO: Implement the handleCheckout function
  // This function should handle the checkout process and validate the address fields
  // If the user is ready to checkout, place the order and navigate to order confirmation
  const handleCheckout = async (e) => {
    // Implement your logic for checkout, validate address and place order
    // Make sure to clear the cart after successful checkout
    e.preventDefault();
    try {
      alert("ordering");
      const response = await fetch(`${apiUrl}/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify({ address }),
        credentials: "include",
      });
      alert("order");
      const data = await response.json();
      if (response.status === 200) {
        alert("Order placed successfully");
        navigate("/order-confirmation");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  // TODO: Implement the handlePinCodeChange function
  // This function should fetch the city and state based on pincode entered by the user
  const handlePinCodeChange = async (e) => {
    const pincode = e.target.value;
    setAddress((prevAddress) => ({ ...prevAddress, pincode }));
  
    if (pincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setAddress((prevAddress) => ({
            ...prevAddress,
            city: postOffice.Name,
            state: postOffice.State,
          }));
        } else {
          setError("Invalid pincode");
        }
      } catch (error) {
        console.error("Error fetching pincode data:", error);
      }
    }
  };

  // TODO: Display error messages if any error occurs
  if (error) {
    return <div className="cart-error">{error}</div>;
  }

  return (
    <>
    <Navbar />
      <div className="cart-container">
        <h1>Your Cart</h1>

        {/* TODO: Display the success or info message */}
        {message && <div className="cart-message">{message}</div>}

        {/* TODO: Implement the cart table UI */}
        {/* If cart is empty, display an empty cart message */}
        {cart.length === 0 ? (
          <p className="empty-cart-message">Your cart is empty</p>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock Available</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.sort((a, b) => a.product_id - b.product_id).map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.name}</td>
                    <td>{item.price}</td>
                    <td>{item.stock_quantity}</td>
                    <td>
                      <button onClick={() => updateQuantity(item.product_id, -1, item.quantity, item.stock_quantity)}>-</button>
                      {item.quantity}
                      <button onClick={() => updateQuantity(item.product_id, 1, item.quantity, item.stock_quantity)}>+</button>
                    </td>
                    <td>{item.price * item.quantity}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.product_id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Implement the address form */}
            <form onSubmit={handleCheckout}>
              <div>
                <label>Pincode:</label>
                {/* <p>{address.pincode}</p> */}
                <input
                  type="text"
                  value={address.pincode}
                  onChange={handlePinCodeChange}
                  required 
                />
                {/* <p>{address.pincode}</p> */}
              </div>
              <div>
                <label>Street:</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>City:</label>
                <input
                  type="text"
                  value={address.city}
                  readOnly
                  required
                />
              </div>
              <div>
                <label>State:</label>
                <input
                type="text"
                value={address.state}
                readOnly
                required
              />
            </div>

            {/* Display total price and the checkout button */}
            <div className="cart-total">
              <h3>Total: ${totalPrice}</h3>
              <button type ="submit" disabled={cart.length === 0}>
                Proceed to Checkout
              </button>
            </div>
          </form>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
