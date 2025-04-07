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
  const { username, email, password, firstName, lastName, genres, dob } = req.body;
  try {
    console.log(req.body);

    // Check if email is already registered

    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate new user_id
    const userIDrow = await pool.query('SELECT COUNT(*) FROM users');
    const userID = parseInt(userIDrow.rows[0].count, 10) + 1;

    // Insert user into the database
    const insertQuery = `
      INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, genres, dob)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await pool.query(insertQuery, [
      userID,
      username,
      email,
      hashedPassword,
      firstName,
      lastName,
      JSON.stringify(genres), // assuming genres is an array
      dob
    ]);

    // Set session
    req.session.userId = userID;


    res.status(200).json({ message: "User Registered Successfully" });

  } catch (error) {
    console.error("Error inserting user:", error);
    res.status(500).json({ message: "Error signing up" });
  }
});

app.get("/all-genres", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres');
    const genres = result.rows;
    res.status(200).json({ message: "Genres fetched successfully", genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Error fetching genres" });
  }
}
);

app.get("/user-genres", async (req, res) => {
  try {
    const result = await pool.query('SELECT genres FROM users where user_id = $1', [req.session.userId]);
    const genresString = result.rows[0].genres;
    console.log(genresString);
    const genres = JSON.parse(genresString);

    res.status(200).json({ message: "Genres fetched successfully", genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Error fetching genres" });
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


app.post("/genre-books", async (req, res) => {
  const { genres } = req.body;
  try {
    let books = {};
    for (let i = 0; i < genres.length; i++) {
      const query = "SELECT * FROM books WHERE genre LIKE $1 ORDER BY publ_date DESC";
      const result = await pool.query(query, [`%${genres[i]}%`]);
      if (result.rows.length !== 0) {
        books[genres[i]] = result.rows;
      }
    }
    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Error fetching books" });
  }
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

app.post("/genre-description", async (req, res) => {
  const { genre } = req.query;
  try {
    const query = "SELECT description FROM genres WHERE genre = $1";
    const result = await pool.query(query, [genre]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Genre not found" });
    }
    const description = result.rows[0].description;
    res.status(200).json({ message: "Description fetched successfully", description });
  } catch (error) {
    console.error("Error fetching description:", error);
    res.status(500).json({ message: "Error fetching description" });
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

app.get("/recommendations" , isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;
  try {
    const query = "SELECT * FROM recommendations WHERE user_id = $1";
    const result = await pool.query(query, [user_id]);
    const recommendations = result.rows;
    res.status(200).json({ message: "Recommendations fetched successfully", recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

app.get("/search", async (req, res) => {
  const { q = "" } = req.query;
  try {
    const searchQuery = `
      SELECT book_id, name, image_link, avg_rating
      FROM books
      WHERE name ILIKE $1
      LIMIT 50;
    `;

    const values = [`%${q}%`];
    const result = await pool.query(searchQuery, values);

    res.status(200).json({
      message: "Books fetched successfully",
      books: result.rows,
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
