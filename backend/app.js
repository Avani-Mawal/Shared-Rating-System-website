const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here
const pool = new Pool({
  user: 'mugdha',
  host: 'localhost',
  database: 'library',
  password: 'avaniorzz',
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// CORS: Give permission to localhost:3000 (ie our React app)
// to use this backend API
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// Session information
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

/////////////////////////////////////////////////////////////
// Authentication APIs
// Signup, Login, IsLoggedIn and Logout

// TODO: Implement authentication middleware
// Redirect unauthenticated users to the login page with respective status code
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(400).json({ message: "Unauthorized" });
}

// TODO: Implement user signup logic
// return JSON object with the following fields: {username, email, password}
// use correct status codes and messages mentioned in the lab document
app.post('/signup', async (req, res) => {
  const { first_name, last_name, username, email, password, dob } = req.body;
  try {
    // Hash the password
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert into the users table
    console.log("S");
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }
    console.log("S");
    const userIDrow = await pool.query('SELECT COUNT(*) FROM users');
    console.log("S");
    const userID = parseInt(userIDrow.rows[0].count,10) + 1;
    const query = "INSERT INTO users (user_id, username, first_name, last_name, email, password_hash, date_joined, dob) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)";
    // const query = "INSERT INTO users (user_id, username, first_name, last_name, email, password_hash, date_joined, dob) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)";
    await pool.query(query, [userID, username, first_name, last_name, email, hashedPassword, dob]);
    console.log("S");
    const q2 = "SELECT user_id FROM users WHERE email = $1";
    const result = await pool.query(q2, [email]);
    console.log("S");
    req.session.userId = result.rows[0].user_id;
    res.status(200).json({ message: "User Registered Successfully" });
  } catch (error) {
    let message = "Error inserting user.";
    console.error(message, error);
    res.status(500).json({ message: "Error signing up" });
  }
});

/// Mugdha : for genres
app.post('/select-genres', async (req, res) => {
  const { userId, genres } = req.body;
  try {
    const query = "UPDATE users SET genres = $1 WHERE user_id = $2";
    await pool.query(query, [genres, userId]);
    res.status(200).json({ message: "Genres updated successfully" });
  } catch (error) {
    console.error("Error updating genres", error);
    res.status(500).json({ message: "Error updating genres" });
  }
});

// TODO: Implement user signup logic
// return JSON object with the following fields: {email, password}
// use correct status codes and messages mentioned in the lab document
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0 || result.rows.length > 1) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const user = result.rows[0];
    if (await bcrypt.compare(password, user.password_hash)) {
      req.session.userId = user.user_id;
      // console.log(req.session.userId);
      res.status(200).json({ message: "Loggn successful" });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in" });
  }

});


// TODO: Implement API used to check if the client is currently logged in or not.
// use correct status codes and messages mentioned in the lab document
app.get("/isLoggedIn", async (req, res) => {
  if (req.session.userId) {
    const query = "SELECT username FROM users WHERE user_id = $1";
    const result = await pool.query(query, [req.session.userId]);
    const username = result.rows[0].username;
    return res.status(200).json({ message: "Logged in", username});
  }
  return res.status(400).json({ message: "User is not logged in" });
});

// TODO: Implement API used to logout the user
// use correct status codes and messages mentioned in the lab document
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to log out" });
    }
    return res.status(200).json({ message: "Logged out successfully" });
  });
});

////////////////////////////////////////////////////
// Mugdha : Using this API to list books in bookshelves
// cover, title, author, avg_rating, rating, shelves, review, date_read, date_added
app.get("/list-products", isAuthenticated, async (req, res) => {
  try {
        const query = `SELECT 
        nbooks.book_id,
        nbooks.name,
        nbooks.author_id,
        nbooks.avg_rating,
        bs.rating,
        bs.shelf_name,
        bs.date_read,
        bs.date_added
      FROM Books AS nbooks
      LEFT OUTER JOIN (
        SELECT *
        FROM Bookshelves
        NATURAL JOIN UserBooks
      ) AS bs
      ON nbooks.book_id = bs.book_id
      WHERE bs.user_id = $1;`
      const result = await pool.query(query, [req.session.userId]);
    const products = result.rows;
    res.status(200).json({ message: "Books fetched successfully", products });
  } catch (error) {
    console.error("Error listing books:", error);
    res.status(500).json({ message: "Error listing books" });
  }
});

// Mugdha : get book details
app.get('/books/:bookId', async (req, res) => {
  const bookId = req.params.bookId;
  const bookQuery = await pool.query(
    'SELECT * FROM books WHERE book_id = $1',
    [bookId]
  );
  const shelvesQuery = await pool.query(
    'SELECT shelf_name FROM bookshelves WHERE book_id = $1',
    [bookId]
  );
  const reviewsQuery = await pool.query(
    'SELECT rating FROM reviews WHERE book_id = $1 and user_id = $2',
    [bookId, req.session.userId]
  );
  console.log(shelvesQuery.rows);
  res.json({
    book: {
      ...bookQuery.rows[0],
      reviews: reviewsQuery.rows,
    },
    shelves: shelvesQuery.rows,
  });
});

// API to rate a book
app.post("/rate-book", isAuthenticated, async (req, res) => {
  const { bookId, rating } = req.body;
  const userId = req.session.userId;

  try {
    // Check if the book exists
    const bookQuery = "SELECT * FROM books WHERE book_id = $1";
    const bookResult = await pool.query(bookQuery, [bookId]);
    if (bookResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    // Check if the user has already rated the book
    const ratingQuery = "SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2";
    const ratingResult = await pool.query(ratingQuery, [userId, bookId]);

    if (ratingResult.rows.length === 0) {
      // Insert new rating
      const reviewIdQuery = "SELECT COALESCE(MAX(review_id), 0) + 1 AS next_id FROM reviews";
      const reviewIdResult = await pool.query(reviewIdQuery);
      const reviewId = reviewIdResult.rows[0].next_id;
      const insertQuery = "INSERT INTO reviews (review_id, user_id, book_id, rating) VALUES ($1, $2, $3, $4)";
      await pool.query(insertQuery, [reviewId, userId, bookId, rating]);
    } else {
      // Update existing rating
      const updateQuery = "UPDATE reviews SET rating = $1 WHERE user_id = $2 AND book_id = $3";
      await pool.query(updateQuery, [rating, userId, bookId]);
    }

    // Update the average rating of the book
    const avgRatingQuery = `
      UPDATE books
      SET avg_rating = (
        SELECT AVG(rating)::numeric(10,2)
        FROM ratings
        WHERE book_id = $1
      )
      WHERE book_id = $1
    `;
    await pool.query(avgRatingQuery, [bookId]);

    res.status(200).json({ message: "Book rated successfully" });
  } catch (error) {
    console.error("Error rating book:", error);
    res.status(500).json({ message: "Error rating book" });
  }
});

// Mugdha : regarding book-details page, Add a shelf
app.post('/add-to-shelf', async (req, res) => {
  console.log(req.session);
  const { book_id, shelf_name } = req.body;
  console.log("user_id:", req.session.userId);
  console.log("Book ID:", book_id);
  console.log("Shelf Name:", shelf_name);

  try {
    // Check if the entry already exists
    const checkQuery = 'SELECT * FROM bookshelves WHERE user_id = $1 AND book_id = $2 AND shelf_name = $3';
    const checkResult = await pool.query(checkQuery, [req.session.userId, book_id, shelf_name]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Entry already exists in the shelf" });
    }

    // Insert the new entry
    const insertQuery = 'INSERT INTO bookshelves (user_id, book_id, shelf_name) VALUES ($1, $2, $3)';
    await pool.query(insertQuery, [req.session.userId, book_id, shelf_name]);

    res.status(200).json({ message: "Book added to shelf successfully" });
  } catch (error) {
    console.error("Error adding to shelf:", error);
    res.status(500).json({ message: "Error adding to shelf" });
  }
});

// API to create a new shelf in books page
app.post("/create-shelf-and-add-book", isAuthenticated, async (req, res) => {
  const { book_id, shelf_name } = req.body;
  const user_id = req.session.userId;
  console.log("user_id:", user_id);
  console.log("Book ID:", book_id);
  
  try {
    // Check if the shelf already exists for the user
    const checkQuery = "SELECT * FROM bookshelves WHERE user_id = $1 AND shelf_name = $2";
    const checkResult = await pool.query(checkQuery, [user_id, shelf_name]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Shelf already exists" });
    }

    // Insert the new shelf
    const insertQuery = "INSERT INTO bookshelves (user_id, book_id, shelf_name) VALUES ($1, $2, $3)";
    await pool.query(insertQuery, [user_id, book_id, shelf_name]);

    res.status(200).json({ message: "Shelf created successfully" });
  } catch (error) {
    console.error("Error creating shelf:", error);
    res.status(500).json({ message: "Error creating shelf" });
  }
});

// API to create a new shelf in books page
app.post("/create-shelf", isAuthenticated, async (req, res) => {
  const { shelf_name } = req.body;
  const user_id = req.session.userId;
  // check this
  // const referer = req.headers.referer || ""; // Default to an empty string if undefined
  // const bookId = referer.includes('/') ? referer.split('/').pop() : null; // Extract bookId if valid
  // console.log("SSS", referer, "Extracted bookId:", bookId);
  // console.log("book_id: ", bookId);
  console.log("Shelf Name:", shelf_name);
  
  try {
    // Check if the shelf already exists for the user
    const checkQuery = "SELECT * FROM bookshelves WHERE user_id = $1 AND shelf_name = $2";
    const checkResult = await pool.query(checkQuery, [user_id, shelf_name]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Shelf already exists" });
    }

    // Insert the new shelf
    const insertQuery = "INSERT INTO bookshelves (user_id, book_id, shelf_name) VALUES ($1, $2, $3)";
    await pool.query(insertQuery, [user_id, bookId, shelf_name]);

    res.status(200).json({ message: "Shelf created successfully" });
  } catch (error) {
    console.error("Error creating shelf:", error);
    res.status(500).json({ message: "Error creating shelf" });
  }
});

// TODO: impliment add to cart API which will add the quantity of the product specified by the user to the cart
app.post("/add-to-cart", isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product_id = productId;
    const query1 = "SELECT * FROM products WHERE product_id = $1";
    const result = await pool.query(query1, [product_id]);
    const product = result.rows[0];
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const q = parseInt(quantity, 10);
    const stock_quantity = parseInt(result.rows[0].stock_quantity, 10);

    const user_id = req.session.userId;
    const query2 = "SELECT * FROM cart WHERE user_id = $1 AND item_id = $2";
    const result2 = await pool.query(query2, [user_id, product_id]);
    const cart_quantity = result2.rows.length === 0 ? 0 : parseInt(result2.rows[0].quantity,10);


    if (stock_quantity < q + cart_quantity) {
      return res.status(400).json({ message: "Insufficient stock for " + product.name });
    }

    if (q + cart_quantity < 0) {
      const query = "DELETE FROM cart WHERE user_id = $1 AND item_id = $2";
      await pool.query(query, [user_id, product_id]);
      return res.status(200).json( { message: "Successfully added " + q + " of "+ product.name+" to your cart." });
    }


    if (result2.rows.length === 0) {
      const query3 = "INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3)";
      await pool.query(query3, [user_id, product_id, q ]);
    } else {
      const query3 = "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3";
      await pool.query(query3, [q + cart_quantity, user_id, product_id]);
    }
    return res.status(200).json( { message: "Successfully added " + q + " of "+ product.name+" to your cart." });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({message : "Error adding to cart."});
  }
});

// TODO: Implement display-cart API which will returns the products in the cart
app.get("/display-cart", isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;
  try {
    const result = await pool.query('SELECT * FROM Cart, Products WHERE user_id = $1 AND item_id = product_id ORDER BY item_id', [user_id]);
    const sum = await pool.query('SELECT SUM(price*quantity) FROM Cart, Products WHERE user_id = $1 AND item_id = product_id', [user_id]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "No items in cart.", cart: [], totalPrice: 0});
    }
    const cart = result.rows;
    const totalPrice = sum.rows[0].sum;
    res.status(200).json({ message: "Cart fetched successfully", cart, totalPrice});

  } catch (error) {
    console.error("Error displaying cart:", error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// TODO: Implement remove-from-cart API which will remove the product from the cart
app.post("/remove-from-cart", isAuthenticated, async (req, res) => {
  const { productId } = req.body;
  try {
    const product_id = parseInt(productId, 10);
    const user_id = req.session.userId;
    const check_query = "SELECT * FROM cart WHERE user_id = $1 AND item_id = $2";
    const check_result = await pool.query(check_query, [user_id, product_id]);

    if (check_result.rows.length === 0) {
      return res.status(400).json({message: "Item not present in your cart."});
    }

    const query = "DELETE FROM cart WHERE user_id = $1 AND item_id = $2";
    await pool.query(query, [user_id, product_id]);
    res.status(200).json({message: "Item removed from your cart successfully."});

  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});
// TODO: Implement update-cart API which will update the quantity of the product in the cart
app.post("/update-cart", isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product_id = parseInt(productId, 10);
    const query1 = "SELECT * FROM products WHERE product_id = $1";
    const result = await pool.query(query1, [product_id]);
    const product = result.rows[0];
    if (result.rows.length === 0) {
      return res.status(500).json({ message: "Error Updating Cart" });
    }

    const q = parseInt(quantity, 10);
    const stock_quantity = parseInt(result.rows[0].stock_quantity, 10);

    const user_id = req.session.userId;
    const query2 = "SELECT * FROM cart WHERE user_id = $1 AND item_id = $2";
    const result2 = await pool.query(query2, [user_id, product_id]);
    const cart_quantity = result2.rows.length === 0 ? 0 : parseInt(result2.rows[0].quantity,10);


    if (stock_quantity < q + cart_quantity) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    }

    if (q + cart_quantity <= 0) {
      const query = "DELETE FROM cart WHERE user_id = $1 AND item_id = $2";
      await pool.query(query, [user_id, product_id]);
      return res.status(200).json( { message: ("Successfully added $1 of $2 to your cart.", [q, product.name]) });
    }


    if (result2.rows.length === 0) {
      const query3 = "INSERT INTO cart (user_id, item_id, quantity) VALUES ($1, $2, $3)";
      await pool.query(query3, [user_id, product_id, q ]);
    } else {
      const query3 = "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3";
      await pool.query(query3, [q + cart_quantity, user_id, product_id]);
    }
    return res.status(200).json( { message: ("Successfully added $1 of $2 to your cart.", [q, product.name]) });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({message : "Error updating cart."});
  }
});

// APIs for placing order and getting confirmation
// TODO: Implement place-order API, which updates the order,orderitems,cart,orderaddress tables
app.post("/place-order", isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;
  const { street, city, state, pincode } = req.body.address;
  console.log(req.body);
  try {
    const check_query = "SELECT * FROM Cart, Products WHERE user_id = $1 AND item_id = product_id AND stock_quantity < quantity";
    const result = await pool.query(check_query, [user_id]);
    if (result.rows.length !== 0) {
      const item = result.rows[0];
      return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
    }

    const query = "SELECT * FROM Cart, Products WHERE user_id = $1 AND item_id = product_id ORDER BY item_id";
    const cart = await pool.query(query, [user_id]);

    const order_date = new Date();
    const total_amount = await pool.query('SELECT SUM(price * quantity) FROM Cart, Products WHERE user_id = $1 AND item_id = product_id', [user_id]);

    const insert_query = "INSERT INTO orders (order_id, user_id, order_date, total_amount) VALUES ((SELECT COUNT(*) + 1 FROM orders), $1, $2, $3) RETURNING order_id";

    const order_result = await pool.query(insert_query, [user_id, order_date, total_amount.rows[0].sum]);
    const order_id = order_result.rows[0].order_id;

    const insert_query2 = "INSERT INTO orderitems (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)";
    if (cart.rows.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (let i = 0; i < cart.rows.length; i++) {
      await pool.query(insert_query2, [order_id, cart.rows[i].item_id, cart.rows[i].quantity, cart.rows[i].price * cart.rows[i].quantity]);
    }

    const reduce_stock = "UPDATE products SET stock_quantity = stock_quantity - (SELECT quantity FROM cart WHERE user_id = $1 AND item_id = product_id) WHERE product_id = (SELECT item_id FROM cart WHERE user_id = $1 AND item_id = product_id)";
    await pool.query(reduce_stock, [user_id]);

    const delete_query = "DELETE FROM cart WHERE user_id = $1";
    await pool.query(delete_query, [user_id]);
    console.log(street, city, state, pincode);
    const insert_address_query = "INSERT INTO OrderAddress (order_id, street, city, state, pincode) VALUES ($1, $2, $3, $4, $5)";
    await pool.query(insert_address_query, [order_id, street, city, state, pincode]);
    
    console.log("hi sansku");
    res.status(200).json({ message: "Order placed successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error placing order" });
  }
});

// API for order confirmation
// TODO: same as lab4
app.get("/order-confirmation", isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;
  try{
    const order_query = "SELECT * FROM orders WHERE user_id = $1 ORDER BY order_id DESC LIMIT 1";
    const order_res = await pool.query(order_query, [user_id]);
    const order = order_res.rows[0];

    const order_items_query = "SELECT orderitems.*, products.price AS product_price, orderitems.price AS order_price, name FROM orderitems, products WHERE order_id = $1 AND orderitems.product_id = products.product_id";
    const order_items = await pool.query(order_items_query, [order.order_id]);

    const order_address_query = "SELECT * FROM orderaddress WHERE order_id = $1";
    const order_address = await pool.query(order_address_query, [order.order_id]);
    const address = order_address.rows[0];

    res.status(200).json({ order: order, order_items: order_items.rows, address: address });

  }catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching order confirmation" });
  }

});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});