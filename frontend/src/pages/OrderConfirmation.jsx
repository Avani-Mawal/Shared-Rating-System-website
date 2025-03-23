import React from "react";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import "../css/OrderConfirmation.css";

const OrderConfirmation = () => {
  // TODO: Implement the checkStatus function
  // If the user is logged in, fetch order details.
  // If not logged in, redirect the user to the login page.
  const navigate = useNavigate(); // Use this to redirect users

  const [order, setOrder] = useState(null);
  const [order_items, setOrderItems] = useState(null);
  const [order_address, setOrderAddress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkStatus = async () => {
      // Implement logic here to check if the user is logged in
      // If not, navigate to /login
      // Otherwise, call the fetchOrderConfirmation function
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.status !== 200){
          navigate("/login");
        } else {
          fetchOrderConfirmation();
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate]);

  // TODO: Use useState to manage the orderDetails and error state


  // TODO: Implement the fetchOrderConfirmation function
  // This function should fetch order details from the API and set the state
  const fetchOrderConfirmation = async () => {
    // e.preventDefault();
    // Implement your API call to fetch order details
    // Update the orderDetails state with the response data
    // Show appropriate error messages if any.
    try {
      const response = await fetch(`${apiUrl}/order-confirmation`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.status === 200) {
        setOrder(data.order);
        setOrderItems(data.order_items);
        setOrderAddress(data.address);
        // alert(data.order.order_id);
        // alert(data.address);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="order-confirmation-container">
        <h1>Order Confirmation</h1>

        {/* Display the order details */}
        {order ? (
          <>
            <h2>Order ID: {order.order_id}</h2>
            <h3>Order Date: {new Date(order.order_date).toLocaleDateString()}</h3>
            <h3>Total Amount: ${order.total_amount}</h3>

            <h3>Shipping Address:</h3>
            <p>{order_address.street}</p>
            <p>{order_address.city}, {order_address.state} - {order_address.pincode}</p>

            <h3>Order Items:</h3>
            <table className="order-table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Price per item</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order_items.sort((a, b) => a.product_id - b.product_id).map((item) => (
                  <tr key={item.product_id}>
                    <td>{item.product_id}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.product_price}</td>
                    <td>{item.order_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={() => navigate("/products")}>Continue Shopping</button>
          </>
        ) : (
          <p>Loading order details...</p>
        )}
      </div>
    </>
  );
};

export default OrderConfirmation;
