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
  user: 'sanskar',
  host: 'localhost',
  database: 'shared_reviews',
  password: 'mugdhaorzz',
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
    const result = await pool.query('SELECT distinct genre_name FROM genre');
    const genres = result.rows;
    res.status(200).json({ message: "Genres fetched successfully", genres });
    console.log(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Error fetching genres" });
  }
}
);

app.post("/update-fav", async (req, res) => {
  const { genre, action } = req.body; 
  const userId = req.session.userId;
  try {
    // Fetch the user's current genres
    const result = await pool.query('SELECT genres FROM users WHERE user_id = $1', [userId]);
    const genresString = result.rows[0]?.genres || "[]";
    let genres = JSON.parse(genresString);

    if (action === 1) {
      // Add genre to favorites if not already present
      if (!genres.includes(genre)) {
        genres.push(genre);
      }
    } else if (action === 0) {
      // Remove genre from favorites
      genres = genres.filter((g) => g !== genre);
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    // Update the user's genres in the database
    await pool.query('UPDATE users SET genres = $1 WHERE user_id = $2', [JSON.stringify(genres), userId]);

    res.status(200).json({ message: "Favorites updated successfully", genres });
  } catch (error) {
    console.error("Error updating Favs: ", error);
    res.status(500).json({ message: "Error updating genres" });
  }})

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
app.get("/list-books", isAuthenticated, async (req, res) => {
  try {
        const query = `
                  SELECT 
                    nbooks.book_id,
                    nbooks.name,
                    authors.author_id,
                    authors.name AS author_name,
                    nbooks.avg_rating,
                    nbooks.image_link,
                    bs.rating,
                    bs.shelf_name,
                    bs.date_read,
                    bs.date_added,
                    r.review_text as review
                  FROM Books AS nbooks
                  LEFT OUTER JOIN authors
                    ON nbooks.author_id + 1 = authors.author_id
                  LEFT OUTER JOIN (
                    SELECT *
                    FROM Bookshelves
                    NATURAL JOIN UserBooks
                  ) AS bs
                    ON nbooks.book_id = bs.book_id
                  LEFT OUTER JOIN reviews r
                    ON r.book_id = nbooks.book_id AND r.user_id = bs.user_id
                  WHERE bs.user_id = $1 
                    AND bs.shelf_name IN ('Want to Read', 'Read', 'Currently Reading');
                `;

      const result = await pool.query(query, [req.session.userId]);
    const books = result.rows;
    console.log(books);
    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (error) {
    console.error("Error listing books:", error);
    res.status(500).json({ message: "Error listing books" });
  }
});


app.get("/list-all-books", isAuthenticated, async (req, res) => {
  try {
        const query = `SELECT 
        nbooks.book_id,
        nbooks.name,
        authors.author_id,
        authors.name AS author_name,
        nbooks.avg_rating,
        nbooks.image_link,
        bs.rating,
        bs.shelf_name,
        bs.date_read,
        bs.date_added,
        r.review_text as review
            FROM Books AS nbooks
            LEFT OUTER JOIN authors
            ON nbooks.author_id + 1 = authors.author_id
            LEFT OUTER JOIN (
        SELECT *
        FROM Bookshelves
        NATURAL JOIN UserBooks
            ) AS bs
            ON nbooks.book_id = bs.book_id
            LEFT OUTER JOIN reviews r
            ON r.book_id = nbooks.book_id AND r.user_id = bs.user_id
            WHERE bs.user_id = $1 AND (bs.shelf_name IS NULL OR bs.shelf_name NOT IN ('Want to Read', 'Read', 'Currently Reading', 'All'));`
      const result = await pool.query(query, [req.session.userId]);
    const books = result.rows;
    console.log(books);
    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (error) {
    console.error("Error listing books:", error);
    res.status(500).json({ message: "Error listing books" });
  }
});

app.get("/shelves", isAuthenticated, async (req, res) => {
  try{
    console.log("Session UserID:", req.session.userId);
    const query = "SELECT DISTINCT shelf_name FROM bookshelves WHERE user_id = $1 and shelf_name not in ('Want to Read', 'Read', 'Currently Reading')";
    const result = await pool.query(query, [req.session.userId]);
    const shelves = result.rows;
    console.log("Shelves:", shelves);
    res.status(200).json({ message: "Shelves fetched successfully", shelves });
  }
  catch (error) {
    console.error("Error fetching shelves:", error);
    res.status(500).json({ message: "Error fetching shelves" });
  }
});

// Mugdha : get book details
app.get('/books/:bookId', async (req, res) => {
  const bookId = req.params.bookId;
  const bookQuery = await pool.query(
    `SELECT 
      books.book_id AS book_id,
      books.name AS name,
      books.isbn,
      books.lang_code,
      books.genre AS genre,
      books.publ_date,
      books.avg_rating,
      books.image_link,
      books.num_pages,
      books.description,
      authors.author_id AS author_id,
      authors.name AS author_name,
      authors.image_link AS author_image
    FROM books
    JOIN authors ON authors.author_id = books.author_id + 1
    WHERE books.book_id = $1`,
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

  const authorQuery = await pool.query(
    'SELECT * FROM authors WHERE author_id = $1',
    [bookQuery.rows[0].author_id + 1]
  );

  console.log("Author", authorQuery.rows[0]);
  console.log("Book", bookQuery.rows[0]);

  genres = JSON.parse(bookQuery.rows[0].genre.replace(/'/g, '"'));
  res.json({
    book: {
      ...bookQuery.rows[0],
      reviews: reviewsQuery.rows,
    },
    genres: genres,
    author: authorQuery.rows[0],
    shelves: shelvesQuery.rows,
  });
});

// Sanskar : Year in books
app.get('/year-in-books/:year', async (req, res) => {
  const year = req.params.year;
  const userId = req.session.userId;
  try {
    const books_query = `
      SELECT sum(*) from userbooks WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2
    `;
    const books_result = await pool.query(books_query, [userId, year]);
    const booksRead = books_result.rows[0].count || 0;

    const pages_query = `
      SELECT SUM(pages) as pages_read FROM userbooks, books WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND userbooks.book_id = books.book_id
    `;
    const pages_result = await pool.query(pages_query, [userId, year]);
    const pagesRead = pages_result.rows[0].pages_read || 0;
    // const top_genres_query = `
    //   SELECT genre, COUNT(*) as count FROM userbooks, books WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND userbooks.book_id = books.book_id GROUP BY genre ORDER BY count DESC LIMIT 5
    // `;
    const top_authors_query = `
      SELECT author_id, COUNT(*) as count FROM userbooks, books WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND userbooks.book_id = books.book_id GROUP BY author_id ORDER BY count DESC LIMIT 5
    `;
    const top_authors_result = await pool.query(top_authors_query, [userId, year]);
    const top_authors = top_authors_result.rows.map(row => row.author_id);
    req.status(200).json({
      message: "Year in books fetched successfully",
      booksRead: booksRead,
      pagesRead: pagesRead,
      topAuthors: top_authors
      // topGenres: top_genres_result.rows.map(row => row.genre),
    });
  }
  catch (error) {
    console.error("Error fetching pages read:", error);
    res.status(500).json({ message: "Error fetching pages read" });
  }
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
   
      const userBooksQuery = "SELECT * FROM userbooks WHERE user_id = $1 AND book_id = $2";
      const userBooksResult = await pool.query(userBooksQuery, [userId, bookId]);
      if (userBooksResult.rows.length > 0) {
        const userBooksquery = "UPDATE userbooks set rating = $1 WHERE user_id = $2 AND book_id = $3";
        await pool.query(userBooksquery, [rating, userId, bookId]);
      }
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

app.post("/add-date-read", isAuthenticated, async (req, res) => {
  const { book_id, date_read } = req.body;
  const userId = req.session.userId;

  try {
    // Update the date_read in the bookshelves table
    const updateQuery = "UPDATE UserBooks SET date_read = $1 WHERE user_id = $2 AND book_id = $3";
    await pool.query(updateQuery, [date_read, userId, book_id]);

    res.status(200).json({ message: "Date read updated successfully" });
  } catch (error) {
    console.error("Error updating date read:", error);
    res.status(500).json({ message: "Error updating date read" });
  }
}
);

// Mugdha : regarding book-details page, Add a shelf
app.post('/sort-shelves', async (req, res) => {
  const { shelf_name } = req.body;
  console.log("Book ID:", shelf_name);
  try {
    // Declare query and result outside the if-else block
    let query;
    let result;

    if (shelf_name != "All") {
      query = `with selected_shelf as (SELECT 
      nbooks.book_id,
      nbooks.name,
      authors.author_id,
      authors.name AS author_name,
      nbooks.avg_rating,
      nbooks.image_link,
      bs.rating,
      bs.shelf_name,
      bs.date_read,
      bs.date_added,
      r.review_text as review
          FROM Books AS nbooks
          LEFT OUTER JOIN authors
          ON nbooks.author_id + 1 = authors.author_id
          LEFT OUTER JOIN (
      SELECT *
      FROM Bookshelves
      NATURAL JOIN UserBooks
          ) AS bs
          ON nbooks.book_id = bs.book_id
          LEFT OUTER JOIN reviews r
          ON r.book_id = nbooks.book_id AND r.user_id = bs.user_id
          WHERE bs.user_id = $1) select * from selected_shelf where shelf_name = $2;`;
     result = await pool.query(query, [req.session.userId, shelf_name]);
    } else {
      query = `SELECT 
      nbooks.book_id,
      nbooks.name,
      authors.author_id,
      authors.name AS author_name,
      nbooks.avg_rating,
      nbooks.image_link,
      bs.rating,
      bs.shelf_name,
      bs.date_read,
      bs.date_added,
      r.review_text as review
          FROM Books AS nbooks
          LEFT OUTER JOIN authors
          ON nbooks.author_id + 1 = authors.author_id
          LEFT OUTER JOIN (
      SELECT *
      FROM Bookshelves
      NATURAL JOIN UserBooks
          ) AS bs
          ON nbooks.book_id = bs.book_id
          LEFT OUTER JOIN reviews r
          ON r.book_id = nbooks.book_id AND r.user_id = bs.user_id
          WHERE bs.user_id = $1 AND bs.shelf_name IN ('Want to Read', 'Read', 'Currently Reading');`
    result = await pool.query(query, [req.session.userId]);
    }

    console.log(result.rows);
    // const shelves = result.rows.map(row => row.shelf_name);
    res.status(200).json({ books: result.rows });
  } catch (error) {
    console.error("Error fetching shelves:", error);
    res.status(500).json({ message: "Error fetching shelves" });
  }
});

// Mugdha : regarding book-details page, Add a shelf

app.post('/add-to-shelf', async (req, res) => {
  console.log(req.session);
  const { book_id, shelf_name } = req.body;
  console.log("user_id:", req.session.userId);
  console.log("Book ID:", book_id);
  console.log("Shelf Name:", shelf_name);
  const read = "Read";
  const wantotreaad = "Want to Read";
  const currentlyreading = "Currently Reading";
  try {

    const ifinshelf = await pool.query('SELECT * FROM bookshelves WHERE user_id = $1 AND book_id = $2 AND shelf_name = $3', [req.session.userId, book_id, shelf_name]);
    
    if (ifinshelf.rows.length > 0) {
      console.log("Already in shelf");
      res.status(200).json({ message: "Already in shelf" });
      return; 
    }
    const checkQuery = 'SELECT * FROM bookshelves WHERE user_id = $1 AND book_id = $2 AND (shelf_name = $3 or shelf_name = $4 or shelf_name = $5)';
    const checkResult = await pool.query(checkQuery, [req.session.userId, book_id, read, wantotreaad, currentlyreading]);
    console.log("Check result:", checkResult.rows);
    
    if (checkResult.rows.length > 0) {
      
      if(!(shelf_name == read || shelf_name == wantotreaad || shelf_name == currentlyreading)) {
        
        console.log("Updating shelf new entry");
        const insertQuery = 'INSERT INTO bookshelves (user_id, book_id, shelf_name) VALUES ($1, $2, $3)';
        await pool.query(insertQuery, [req.session.userId, book_id, shelf_name]);
        
        const checkUserBooks = await pool.query('SELECT * FROM userbooks WHERE user_id = $1 AND book_id = $2', [req.session.userId, book_id]);
        if (checkUserBooks.rows.length == 0) {
          const insertUserBooksQuery = 'INSERT INTO userbooks (user_id, book_id, rating) VALUES ($1, $2, 3)';
          await pool.query(insertUserBooksQuery, [req.session.userId, book_id]);
        }

        res.status(200).json({ message: "Book added to shelf successfully" });
        return; 

      } else {
        console.log("Updating shelf");
        const updateQuery = 'UPDATE bookshelves SET shelf_name = $1 WHERE user_id = $2 AND book_id = $3 AND shelf_name = $4';
        
        const checkUserBooks = await pool.query('SELECT * FROM userbooks WHERE user_id = $1 AND book_id = $2', [req.session.userId, book_id]);
        if (checkUserBooks.rows.length == 0) {
          const insertUserBooksQuery = 'INSERT INTO userbooks (user_id, book_id) VALUES ($1, $2)';
          await pool.query(insertUserBooksQuery, [req.session.userId, book_id]);
        }

        await pool.query(updateQuery, [shelf_name, req.session.userId, book_id, checkResult.rows[0].shelf_name]);
        res.status(200).json({ message: "Shelf updated successfully" });
        return; 
      }
    }
    // Insert the new entry
    if (shelf_name == read || shelf_name == wantotreaad || shelf_name == currentlyreading) {
      console.log("Inserting shelf first entry");
        const insertQuery = 'INSERT INTO bookshelves (user_id, book_id, shelf_name) VALUES ($1, $2, $3)';
        const insertUserBooksQuery = 'INSERT INTO userbooks (user_id, book_id, rating) VALUES ($1, $2, 3)';
        await pool.query(insertUserBooksQuery, [req.session.userId, book_id]);
        console.log("Inserting into shelf");
        await pool.query(insertQuery, [req.session.userId, book_id, shelf_name]);
        res.status(200).json({ message: "Book added to shelf successfully" });
        return; 
    } else {
      res.status(400).json({ message: "Invalid shelf name" });
      return; // Ensure the function exits after sending a response
    }
   
    
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

app.post("/add-review", isAuthenticated, async (req, res) => {
  const {book_id, review_text, rating} = req.body;
  try{
    const user_id = req.session.userId;
    const insertQuery = "INSERT INTO reviews (user_id, book_id, review_text, rating) VALUES ($1, $2, $3, $4)";
    await pool.query(insertQuery, [user_id, book_id, review_text, rating]);

    res.status(200).json({ message: "Review added successfully" });
  } catch(error){
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review" });
  }
});

app.post("/edit-review", isAuthenticated, async (req, res) => {
  const {book_id, review_text, rating} = req.body;
  try{
    const user_id = req.session.userId;
    const updateQuery = "UPDATE reviews SET review_text = $1, rating = $2 WHERE user_id = $3 AND book_id = $4";
    await pool.query(updateQuery, [review_text, rating, user_id, book_id]);
    res.status(200).json({ message: "Review updated successfully" });
  } catch(error){
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review" });
  }
});

app.post("/get-reviews", isAuthenticated, async (req, res) => {
  try{
    const { book_id } = req.body;
    const user_id = req.session.userId;
    
    console.log("Book ID:", book_id);
    const query = `Select reviews.user_id, 
                   reviews.rating, 
                   reviews.review_text,
                    reviews.review_date,
                    users.username
                    from reviews, users
                    where reviews.book_id = $1 and 
                    reviews.user_id = users.user_id`;
    const reviews = await pool.query(query, [book_id]);

    const checkQuery = `SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2 AND review_text IS NOT NULL`;
    const checkResult = await pool.query(checkQuery, [user_id, book_id]);
    
    userReview = null;
    if (checkResult.rows.length > 0) {
      userReview = checkResult.rows[0].review_text;
    }

    console.log(reviews.rows);
    res.status(200).json({ message: "Reviews fetched successfully", reviews: reviews.rows, userReview });
  }catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// API to create a new shelf in books page
app.post("/create-shelf", isAuthenticated, async (req, res) => {
  const { shelf_name } = req.body;
  const user_id = req.session.userId;
  
  console.log("Shelf Name:", shelf_name);
  
  try {
    // Check if the shelf already exists for the user
    const checkQuery = "SELECT * FROM bookshelves WHERE user_id = $1 AND shelf_name = $2";
    const checkResult = await pool.query(checkQuery, [user_id, shelf_name]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "Shelf already exists" });
    }

    // Insert the new shelf
    const insertQuery = "INSERT INTO bookshelves (user_id, shelf_name) VALUES ($1, $2)";
    await pool.query(insertQuery, [user_id, shelf_name]);

    res.status(200).json({ message: "Shelf created successfully" });
  } catch (error) {
    console.error("Error creating shelf:", error);
    res.status(500).json({ message: "Error creating shelf" });
  }
});

app.post("/genre-description", async (req, res) => {
  const { genre } = req.body;
  try {
    console.log("Genre:", genre);
    const query = "SELECT genre_desc FROM genre WHERE genre_name = $1";
    const result = await pool.query(query, [genre]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Genre not found" });
    }
    const description = result.rows[0].genre_desc;
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

  // Language name to code map
  const langMap = {
    english: "en",
    french: "fr",
    german: "de",
    spanish: "es",
    japanese: "ja",
    chinese: "zh",
    hindi: "hi",
    // Add more if needed
  };

  try {
    const searchTerm = q.toLowerCase();
    const mappedLangCode = langMap[searchTerm];

    const values = [`%${searchTerm}%`, mappedLangCode || ""];

    const searchQuery = `
      SELECT book_id, books.name, books.author_id, books.image_link, avg_rating, lang_code
      FROM books, authors
      WHERE authors.author_id = (books.author_id+1) AND ( books.name ILIKE $1 OR authors.name ILIKE $1  OR lang_code = $2)
      LIMIT 50;
    `;

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


// Anushka trending books
app.get('/top-rated-books', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM books ORDER BY avg_rating DESC LIMIT 10`
    );
    res.status(200).json({ books: result.rows });
  } catch (err) {
    console.error("Error fetching top-rated books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Anushka new releases

app.get('/new-releases-books', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM books ORDER BY publ_date DESC LIMIT 10`
    );
    res.status(200).json({ books: result.rows });
  } catch (err) {
    console.error("Error fetching newly released books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Anushka user details

app.get('/user-details', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "User not logged in" });
    }

    const query = "SELECT * FROM users WHERE user_id = $1";
    const result = await pool.query(query, [req.session.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/authors", async (req, res) => {
  try {
    
    const result = await pool.query(
      "SELECT author_id, name, image_link FROM Authors"
    );
    res.json({ authors: result.rows });
  } catch (err) {
    console.error("Error fetching authors:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.get('/authors/:authorId', async (req, res) => {
  const authorId = req.params.authorId;

  // Validate input
  if (isNaN(authorId)) {
    return res.status(400).json({ message: "Invalid author ID" });
  }

  try {
    // Fetch author details
    console.log("Author ID:", authorId);
    const authorQuery = await pool.query(
      'SELECT * FROM authors WHERE author_id = $1',
      [authorId]
    );

    console.log("Author Query:", authorQuery.rows);

    if (authorQuery.rows.length === 0) {
      return res.status(404).json({ message: "Author not found" });
    }

    const author = authorQuery.rows[0];

    // Fetch books by the author
    const booksQuery = await pool.query(
      'SELECT book_id, name, image_link, avg_rating FROM Books WHERE author_id = $1',
      [authorId-1] // if you're storing author name strings
    );

    res.json({
      author,
      books: booksQuery.rows,
    });
  } catch (err) {
    console.error("Error fetching author details:", err);
    res.status(500).json({ message: "Server error" });
  }
});


////////////////////////////////////////////////////
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
