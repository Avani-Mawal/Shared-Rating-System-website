const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
const app = express();
const port = 4000;

// PostgreSQL connection
// NOTE: use YOUR postgres username and password here

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Bookhive25@gmail.com',          // your Gmail ID
    pass: 'mhki jjlk frwy ewnd'               // your Gmail App password (not Gmail login password)
  }
});

////////////edit
genres = ["Fiction", "Fantasy", "Audiobook", "Romance", "Young Adult", "Mystery", "Classics", "Contemporary",
  "Historical Fiction", "Book Club", "Thriller", "Nonfiction", "Science Fiction", "Adventure", "Paranormal",
  "Crime", "Literature", "Historical", "Childrens", "Mystery Thriller", "Novels", "Humor", "Suspense", "Adult",
  "Horror", "Chick Lit", "Middle Grade", "Biography", "Magic", "Science Fiction Fantasy", "Urban Fantasy",
  "Memoir", "Vampires", "Literary Fiction", "History", "High Fantasy", "Paranormal Romance", "Dystopia",
  "Philosophy", "Graphic Novels", "Realistic Fiction", "Adult Fiction", "Epic Fantasy", "Short Stories",
  "Contemporary Romance", "Comics", "Supernatural", "Psychology", "School", "Animals", "Self Help", "Comedy",
  "Biography Memoir", "Science", "Picture Books", "American", "War", "Graphic Novels Comics", "Politics",
  "Religion", "Detective", "Poetry", "Autobiography"]


const genreToIndex = {};
const indexToGenre = {};

genres.forEach((genre, idx) => {
  genreToIndex[genre.toLowerCase()] = idx;
});

genres.forEach((genre, idx) => {
  indexToGenre[idx] = genre.toLowerCase();
});

function getGenresFromBitmap(bitmapFromDB) {
  const selectedGenres = [];
  const bigBitmap = BigInt(bitmapFromDB); // Safely convert DB value to BigInt
  
  for (let i = 0; i < genres.length; i++) {
    if (bigBitmap & (1n << BigInt(i))) {
      selectedGenres.push(genres[i]);
    }
  }
  
  return selectedGenres;
}

async function sendCompletionEmail(userEmail, bookDetails) {
  console.log("Sending email to:", userEmail);
  console.log("Book details:", bookDetails);
  const mailOptions = {
    from: 'BookHive@gmail.com',
    to: userEmail.email,
    subject: `Congratulations on completing "${bookDetails.title}"!`,
    html: `
  <h1>Congratulations on Finishing Your Book!</h1>
  <p>Hi there,</p>
  <p>You've just completed reading <strong>${bookDetails.title}</strong> by <em>${bookDetails.author}</em> — what an achievement!</p>

  <p>We hope this book took you on an incredible journey, opened up new perspectives, or simply gave you a chance to relax and enjoy a well-told story. Whether it made you laugh, cry, think, or dream — that's the magic of reading.</p>

  <p>Finishing a book is always a moment worth celebrating, and we're proud to be a part of your reading journey.</p>

  <blockquote style="font-style: italic; margin: 20px 0; padding: 10px 20px; background-color: #f9f9f9; border-left: 4px solid #ccc;">
    “A reader lives a thousand lives before he dies. The man who never reads lives only one.” – George R.R. Martin
  </blockquote>

  <p>Thank you for choosing to read with us. Keep turning pages, discovering new stories, and feeding your curiosity.</p>

  <p>📚 Until your next great read,<br>The BookTracker Team</p>
`

  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

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
    // console.log(req.body);
    // 
    // Check if email is already registered
    let bitmap = 0;
    console.log("Genres:", genres);
    for (const genre of genres) {
      const index = genreToIndex[genre.toLowerCase()];
      // console.log("Index:", index);
      if (index !== undefined) {
        bitmap |= (1 << index);
      } else {
        console.warn(`Genre '${genre}' not found in genreToIndex mapping!`);
      }
    } 

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
      INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, genre_bitmap, genres, dob)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await pool.query(insertQuery, [
      userID,
      username,
      email,
      hashedPassword,
      firstName,
      lastName,
      bitmap, // assuming genres is an array
      genres,
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

app.post('/send-completion-mail', async (req, res) => {
  const { name, author } = req.body;
  try{
    console.log("Session UserID:", req.session.userId);
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("entered send completion mail successfully");
    const user = req.session.userId;
    const result = await pool.query('SELECT email FROM users WHERE user_id = $1', [user]);
    const email = result.rows[0];
    await sendCompletionEmail(email, {
      title: name,
      author: author,
    });
    console.log("Email sent successfully");
  res.json({ success: true });
  } catch (error) {
    console.error("Error checking session:", error);
  }
});

app.get("/all-genres", async (req, res) => {
  try {
    const result = await pool.query('SELECT distinct genre_name FROM genre');
    const genres = result.rows;
    res.status(200).json({ message: "Genres fetched successfully", genres });
    // console.log(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Error fetching genres" });
  }
});

app.post("/get-recommendations-from-genre", async(req, res) => {
  // const query = "SELECT * FROM books WHERE (genre_bitmap & $1) != 0 ORDER BY publ_date DESC";

  const {selectedGenre} = req.body;
  console.log("Selected genre:", selectedGenre);
  const userId = await req.session.userId;
  try{
    // console.log(selectedGenre);
    const genreName = selectedGenre;
    const index = genreToIndex[genreName.toLowerCase()];
    const bitmask = 1 << index;
    console.log("genreName:", genreName);
    const query = "SELECT * FROM books, reviews WHERE reviews.book_id = books.book_id AND book.base_genre = $1 AND reviews.user_id = $2";
    const result = await pool.query(query, [bitmask, userId]);

    const books = result.rows;
    console.log("Books:", books);
    if (books.length <= 5) {
      console.log(books.length);
      return res.status(400).json({ message: "Rate atleast 5 books to get recommendations!!" });
    }

    bookNames = [];
    bookGenres = [];
    bookRatings = [];
    for (let i = 0; i < books.length; i++) {
      bookNames.push(books[i].name);
      bookGenres.push(selectedGenre);
      bookRatings.push(books[i].rating);
    }

    const params = new URLSearchParams();
    bookNames.forEach(name => params.append('book_names[]', name));
    bookGenres.forEach(genre => params.append('book_genres[]', genre));
    bookRatings.forEach(rating => params.append('book_ratings[]', rating));

    // Make the GET request to the Flask endpoint
    const response = await fetch(`http://127.0.0.1:5000/reccomendation-from-books?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    let recBooks= [];
    for (let i = 0; i < data.length; i++) {
      const query = "SELECT * FROM books WHERE book_id = $1";
      const result = await pool.query(query, [data[i]]);
      if (result.rows.length !== 0) {
        recBooks.push(result.rows[0]);
      }
    }
    res.status(200).json({ message: "Recommendations fetched successfully", books: recBooks });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations" });
  }
});

app.post("/get-similar-books", async(req, res) => {
  const {name , genre} = req.body;
  try {
    const response = await fetch(`http://127.0.0.1:5000/recommend?title=${encodeURIComponent(name)}&genre=${encodeURIComponent(genre)}`);
    const data = await response.json();
    let books = [];
    for (let i = 0; i < data.length; i++) {
      const query = "SELECT * FROM books WHERE book_id = $1";
      const result = await pool.query(query, [data[i]]);
      if (result.rows.length !== 0) {
        books.push(result.rows[0]);
      }
    }
    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (error) {
    console.error("Error fetching similar books:", error);
    res.status(500).json({ message: "Error fetching smiilar books" });
  }
});

// app.get("/user-genres", async (req, res) => {
//   try {
//     const result = await pool.query('SELECT genres FROM users where user_id = $1', [req.session.userId]);
//     const genresString = result.rows[0].genres;
//     // console.log(genresString);
//     const genres = JSON.parse(genresString);

//     res.status(200).json({ message: "Genres fetched successfully", genres });
//   } catch (error) {
//     console.error("Error fetching genres:", error);
//     res.status(500).json({ message: "Error fetching genres" });
//   }
// });

app.get("/user-genres", async (req, res) => {
  try {
    const result = await pool.query('SELECT genre_bitmap FROM users where user_id = $1', [req.session.userId]);
    console.log("bitmap:", result.rows[0].genre_bitmap);
    const genres = getGenresFromBitmap(result.rows[0].genre_bitmap);
    console.log("User genres:", genres);
    res.status(200).json({ message: "Genres fetched successfully", genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    res.status(500).json({ message: "Error fetching genres" });
  }
});


app.post("/update-fav", async (req, res) => {
  const { genre, action } = req.body;
  const userId = req.session.userId;
  try {
    // Fetch the user's current genres
    const result = await pool.query('SELECT genre_bitmap FROM users WHERE user_id = $1', [userId]);
    // const genresString = result.rows[0]?.genres || "[]";

    let new_map = result.rows[0].genre_bitmap; // Start from current bitmap

    if (action === 1) {
      new_map = new_map | (1 << genreToIndex[genre.toLowerCase()]); // Set the bit

    } else if (action === 0) {
      // Remove genre from favorites
      new_map = new_map & ~(1 << genreToIndex[genre.toLowerCase()]); // Clear the bit
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

   // Update the user's genres in the database
    await pool.query('UPDATE users SET genre_bitmap = $1 WHERE user_id = $2', [new_map, userId]);

    res.status(200).json({ message: "Favorites updated successfully", genres });
  } catch (error) {
    console.error("Error updating Favs: ", error);
    res.status(500).json({ message: "Error updating genres" });
  }
})
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
    return res.status(200).json({ message: "Logged in", username });
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
      const genreName = genres[i];
      const index = genreToIndex[genreName.toLowerCase()];
      const bitmask = 1 << index; // Calculate the bitmask for that genre
      const query = "SELECT * FROM books WHERE (genre_bitmap & $1) != 0 ORDER BY publ_date DESC";
      const result = await pool.query(query, [bitmask]);
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
    // console.log(books);
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
    // console.log(books);
    res.status(200).json({ message: "Books fetched successfully", books });
  } catch (error) {
    console.error("Error listing books:", error);
    res.status(500).json({ message: "Error listing books" });
  }
});

app.get("/shelves", isAuthenticated, async (req, res) => {
  try {
    // console.log("Session UserID:", req.session.userId);
    const query = "SELECT DISTINCT shelf_name FROM bookshelves WHERE user_id = $1 and shelf_name not in ('Want to Read', 'Read', 'Currently Reading')";
    const result = await pool.query(query, [req.session.userId]);
    const shelves = result.rows;
    // console.log("Shelves:", shelves);
    res.status(200).json({ message: "Shelves fetched successfully", shelves });
  }
  catch (error) {
    console.error("Error fetching shelves:", error);
    res.status(500).json({ message: "Error fetching shelves" });
  }
});

// Mugdha : get book details
app.get('/books/:bookId', async (req, res) => {
  try{
    const bookId = req.params.bookId;
    const bookQuery = await pool.query(
      `SELECT 
        books.book_id AS book_id,
        books.name AS name,
        books.isbn,
        books.lang_code,
        books.genre_bitmap AS genre,
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
      [(bookQuery.rows[0].author_id)]
    );

    let genres = getGenresFromBitmap(bookQuery.rows[0].genre);
    res.json({
      book: {
        ...bookQuery.rows[0],
        reviews: reviewsQuery.rows,
      },
      genres: genres,
      author: authorQuery.rows[0],
      shelves: shelvesQuery.rows,
    });
    }
  catch (error){
    console.log("Error getting books page : ", error);
  }

});

app.post("/add-review-from-drafts", isAuthenticated, async (req, res) => {
  const { review_id } = req.body;

  try {
    const user_id = req.session.userId;

    // Check if the draft exists for the current user
    const checkDraftQuery = `
      SELECT * FROM DraftReviews WHERE review_id = $1 AND user_id = $2
    `;
    const result = await pool.query(checkDraftQuery, [review_id, user_id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized to add this review" });
    }

    // Get draft data
    const draft = result.rows[0];

    // Check if the user has already added a review for this book
    const checkExistingReviewQuery = `
      SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2
    `;
    const existingReviewResult = await pool.query(checkExistingReviewQuery, [user_id, draft.book_id]);

    if (existingReviewResult.rows.length > 0) {
      // If a review already exists, update it
      const updateReviewQuery = `
        UPDATE reviews SET review_text = $1, rating = $2 WHERE user_id = $3 AND book_id = $4
      `;
      await pool.query(updateReviewQuery, [draft.review_text, draft.rating, user_id, draft.book_id]);
      res.status(200).json({ message: "Review updated successfully" });
    } else {
      // If no review exists, insert the draft data into the Reviews table
      const insertReviewQuery = `
        INSERT INTO reviews (user_id, book_id, review_text, rating) 
        VALUES ($1, $2, $3, $4)
      `;
      await pool.query(insertReviewQuery, [user_id, draft.book_id, draft.review_text, draft.rating]);

      res.status(200).json({ message: "Review added successfully" });
    }

    // Delete the draft from DraftReviews table after processing
    const deleteDraftQuery = `
      DELETE FROM DraftReviews WHERE review_id = $1 AND user_id = $2
    `;
    await pool.query(deleteDraftQuery, [review_id, user_id]);

  } catch (error) {
    console.error("Error adding or updating review:", error);
    res.status(500).json({ message: "Error processing review" });
  }
});

app.get("/list-drafts", isAuthenticated, async (req, res) => {
  try {
    const user_id = req.session.userId;
    const drafts = await pool.query(`
      SELECT d.review_id, d.rating, d.review_text, b.name AS book_name
      FROM DraftReviews d
      JOIN Books b ON d.book_id = b.book_id
      WHERE d.user_id = $1
    `, [user_id]);

    res.status(200).json({ drafts: drafts.rows });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ message: "Error fetching drafts" });
  }
});


app.post("/save-draft", isAuthenticated, async (req, res) => {
  const { book_id, review_text, rating } = req.body;
  try {
    const user_id = req.session.userId;
    const insertQuery = `
      INSERT INTO DraftReviews (user_id, book_id, rating, review_text)
      VALUES ($1, $2, $3, $4)
    `;
    console.log("Insert Draft Query:", insertQuery);
    await pool.query(insertQuery, [user_id, book_id, rating, review_text]);

    res.status(200).json({ message: "Draft saved successfully" });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({ message: "Error saving draft" });
  }
});
app.post("/edit-draft", isAuthenticated, async (req, res) => {
  const { review_id, review_text, rating } = req.body;

  try {
    const user_id = req.session.userId;

    const checkQuery = `
      SELECT * FROM DraftReviews WHERE review_id = $1 AND user_id = $2
    `;
    const result = await pool.query(checkQuery, [review_id, user_id]);

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized to edit this draft" });
    }

    const updateQuery = `
      UPDATE DraftReviews
      SET review_text = $1, rating = $2
      WHERE review_id = $3 AND user_id = $4
    `;

    await pool.query(updateQuery, [review_text, rating, review_id, user_id]);

    res.status(200).json({ message: "Draft updated successfully" });
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ message: "Error updating draft" });
  }
});


// Sanskar : Year in books
app.get('/year-in-books/:year', async (req, res) => {
  const year = req.params.year;
  const userId = req.session.userId;
  try {
    const books_query = `
      SELECT COUNT(*) as count from userbooks WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2
    `;
    const books_result = await pool.query(books_query, [userId, year]);
    const booksRead = books_result.rows[0].count || 0;

    const avg_rating_query = `
      SELECT AVG(reviews.rating) as avg_rating FROM reviews, userbooks WHERE reviews.user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND reviews.book_id = userbooks.book_id AND reviews.user_id = userbooks.user_id AND reviews.book_id = userbooks.book_id
    `;
    const avg_rating_result = await pool.query(avg_rating_query, [userId, year]);
    const avgRating = avg_rating_result.rows[0].avg_rating || 0;

    const pages_query = `
      SELECT SUM(num_pages) as pages_read FROM userbooks, books WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND userbooks.book_id = books.book_id
    `;
    const pages_result = await pool.query(pages_query, [userId, year]);
    const pagesRead = pages_result.rows[0].pages_read || 0;

    const top_authors_query = `
      SELECT authors.name, COUNT(*) as count FROM userbooks, books, authors WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND userbooks.book_id = books.book_id AND books.author_id + 1 = authors.author_id GROUP BY authors.name ORDER BY count DESC LIMIT 5
    `;
    const top_authors_result = await pool.query(top_authors_query, [userId, year]);
    const top_authors = top_authors_result.rows.map(row => row.name);

    const top_books_query = `
      SELECT books.name, reviews.rating, books.image_link, books.book_id, authors.name as author_name, authors.author_id as author_id FROM userbooks, books, authors, reviews WHERE userbooks.user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 AND userbooks.book_id = books.book_id AND books.author_id + 1 = authors.author_id AND userbooks.book_id = reviews.book_id AND userbooks.user_id = reviews.user_id ORDER BY reviews.rating DESC LIMIT 5
    `;
    const top_books_result = await pool.query(top_books_query, [userId, year]);

    const monthly_stats_query = `
      SELECT EXTRACT(MONTH FROM date_read) as month, COUNT(*) as count FROM userbooks WHERE user_id = $1 AND date_read IS NOT NULL AND EXTRACT(YEAR FROM date_read) = $2 GROUP BY month ORDER BY month
    `;
    const monthly_stats_result = await pool.query(monthly_stats_query, [userId, year]);
    const month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthly_stats = monthly_stats_result.rows.map(row => ({
      name: month_names[row.month - 1],
      count: row.count
    }));

    res.status(200).json({
      message: "Year in books fetched successfully",
      booksRead: booksRead,
      averageRating: avgRating,
      pagesRead: pagesRead,
      topAuthors: top_authors,
      topBooks: top_books_result.rows,
      monthlyStats: monthly_stats
    });
  }
  catch (error) {
    console.error("Error fetching pages read:", error);
    res.status(500).json({ message: "Error fetching year in books data" });
  }
});

// API to rate a book
app.post("/add-rating", isAuthenticated, async (req, res) => {
  const { bookId, rating } = req.body;
  const userId = req.session.userId;

  try {

    const ratingQuery = "SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2";
    const ratingResult = await pool.query(ratingQuery, [userId, bookId]);
    console.log(1);
    if (ratingResult.rows.length === 0) {
      // Insert new rating
      const reviewIdQuery = "SELECT COALESCE(MAX(review_id), 0) + 1 AS next_id FROM reviews";
      const reviewIdResult = await pool.query(reviewIdQuery);
      const reviewId = reviewIdResult.rows[0].next_id;
      const insertQuery = "INSERT INTO reviews (review_id, user_id, book_id, rating) VALUES ($1, $2, $3, $4)";
      await pool.query(insertQuery, [reviewId, userId, bookId, rating]);
      const userBooksQuery = "SELECT * FROM userbooks WHERE user_id = $1 AND book_id = $2";

      const userBooksResult = await pool.query(userBooksQuery, [userId, bookId]);
      if (userBooksResult.rows.length > 0) {
        console.log(userId, "usrid");
        const userBooksquery = "UPDATE userbooks set rating = $1 WHERE user_id = $2 AND book_id = $3";
        await pool.query(userBooksquery, [rating, userId, bookId]);
      }
      console.log(2);
    } else {
      // Update existing rating
      const updateQuery = "UPDATE reviews SET rating = $1 WHERE user_id = $2 AND book_id = $3";
      await pool.query(updateQuery, [rating, userId, bookId]);
      //add condition update userbooks only if that book exists
      console.log(3);
      // Check if the book exists in userbooks
      const userBooksQuery = "SELECT * FROM userbooks WHERE user_id = $1 AND book_id = $2";
      const userBooksResult = await pool.query(userBooksQuery, [userId, bookId]);
      if (userBooksResult.rows.length > 0) {
        console.log(userId, "usrid");
        const userBooksquery = "UPDATE userbooks set rating = $1 WHERE user_id = $2 AND book_id = $3";
        await pool.query(userBooksquery, [rating, userId, bookId]);
      }
    }
    console.log(4);
    // Update the average rating of the book
    const avgRatingQuery = `
      UPDATE books
      SET avg_rating = (
        SELECT AVG(rating)::numeric(10,2)
        FROM reviews
        WHERE book_id = $1
      )
      WHERE book_id = $1
    `;
    await pool.query(avgRatingQuery, [bookId]);
    console.log("Book rated successfully");

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

// Fetch book details
app.get('/book-review/:bookId', async (req, res) => {
  const { bookId } = req.params;
  try {
    const bookRes = await pool.query('SELECT name, image_link FROM Books WHERE book_id = $1', [bookId]);
    if (bookRes.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ book: bookRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post review
app.post('/rate-book', async (req, res) => {
  const { bookId, rating, review } = req.body;
  const userId = 1; // hardcoded for demo; normally extracted from session

  try {
    // Insert/Update UserBooks table
    await pool.query(
      `INSERT INTO UserBooks (user_id, book_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET rating = EXCLUDED.rating`,
      [userId, bookId, rating]
    );

    // Insert review
    await pool.query(
      `INSERT INTO Reviews (user_id, book_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET rating = EXCLUDED.rating, review_text = EXCLUDED.review_text, review_date = CURRENT_DATE`,
      [userId, bookId, rating, review]
    );

    res.status(200).json({ message: 'Review added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mugdha : regarding book-details page, Add a shelf
app.post('/sort-shelves', async (req, res) => {
  const { shelf_name } = req.body;
  // console.log("Book ID:", shelf_name);
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

    // console.log(result.rows);
    // const shelves = result.rows.map(row => row.shelf_name);
    res.status(200).json({ books: result.rows });
  } catch (error) {
    console.error("Error fetching shelves:", error);
    res.status(500).json({ message: "Error fetching shelves" });
  }
});

// Mugdha : regarding book-details page, Add a shelf

app.post('/add-to-shelf', async (req, res) => {
  // console.log(req.session);
  const { book_id, shelf_name } = req.body;
  // console.log("user_id:", req.session.userId);
  // console.log("Book ID:", book_id);
  // console.log("Shelf Name:", shelf_name);
  const read = "Read";
  const wantotreaad = "Want to Read";
  const currentlyreading = "Currently Reading";
  try {
    const query = `DELETE FROM Bookshelves WHERE user_id = $1 AND shelf_name = $2 AND book_id IS NULL`;
    await pool.query(query, [req.session.userId, shelf_name]);
    const ifinshelf = await pool.query('SELECT * FROM bookshelves WHERE user_id = $1 AND book_id = $2 AND shelf_name = $3', [req.session.userId, book_id, shelf_name]);

    if (ifinshelf.rows.length > 0) {
      // console.log("Already in shelf");
      res.status(200).json({ message: "Already in shelf" });
      return;
    }
    const checkQuery = 'SELECT * FROM bookshelves WHERE user_id = $1 AND book_id = $2 AND (shelf_name = $3 or shelf_name = $4 or shelf_name = $5)';
    const checkResult = await pool.query(checkQuery, [req.session.userId, book_id, read, wantotreaad, currentlyreading]);
    // console.log("Check result:", checkResult.rows);

    if (checkResult.rows.length > 0) {

      if (!(shelf_name == read || shelf_name == wantotreaad || shelf_name == currentlyreading)) {

        // console.log("Updating shelf new entry");
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
        // console.log("Updating shelf");
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
      // console.log("Inserting shelf first entry");
      const insertQuery = 'INSERT INTO bookshelves (user_id, book_id, shelf_name) VALUES ($1, $2, $3)';
      const insertUserBooksQuery = 'INSERT INTO userbooks (user_id, book_id, rating) VALUES ($1, $2, 3)';
      await pool.query(insertUserBooksQuery, [req.session.userId, book_id]);
      // console.log("Inserting into shelf");
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
  // console.log("user_id:", user_id);
  // console.log("Book ID:", book_id);

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
  const { book_id, review_text, rating } = req.body;
  try {
    const user_id = req.session.userId;
    const if_rating_exists = await pool.query("SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2", [user_id, book_id]);

    if (if_rating_exists.rows.length > 0) {
      const updateQuery = "UPDATE reviews SET review_text = $1, rating = $2 WHERE user_id = $3 AND book_id = $4";
      console.log("Update Query:", updateQuery);
      await pool.query(updateQuery, [review_text, rating, user_id, book_id]);
    }else{
      const insertQuery = "INSERT INTO reviews (user_id, book_id, review_text, rating) VALUES ($1, $2, $3, $4)";
       // console.log("Insert Query:", insertQuery);
      await pool.query(insertQuery, [user_id, book_id, review_text, rating]);
    }
    
    res.status(200).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Error adding review" });
  }
});

app.post("/edit-review", isAuthenticated, async (req, res) => {
  const { book_id, review_text, rating } = req.body;
  try {
    const user_id = req.session.userId;
    const updateQuery = "UPDATE reviews SET review_text = $1, rating = $2 WHERE user_id = $3 AND book_id = $4";
    await pool.query(updateQuery, [review_text, rating, user_id, book_id]);
    res.status(200).json({ message: "Review updated successfully" });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Error updating review" });
  }
});

app.post("/get-reviews", async (req, res) => {
  try {
    const { book_id } = req.body;
    const user_id = req.session.userId;
    // console.log("Book ID:", book_id);
    const query = `Select reviews.user_id, 
                   reviews.rating, 
                   reviews.review_text,
                    reviews.review_date,
                    users.username
                    from reviews, users
                    where reviews.book_id = $1 and 
                    reviews.user_id = users.user_id`;
    const reviews = await pool.query(query, [book_id]);
    userReview = null;
    if (user_id != null) {
      const checkQuery = `SELECT * FROM reviews WHERE user_id = $1 AND book_id = $2 AND review_text IS NOT NULL`;
      const checkResult = await pool.query(checkQuery, [user_id, book_id]);

      if (checkResult.rows.length > 0) {
        userReview = checkResult.rows[0].review_text;
      }

      console.log(reviews.rows);
    }
    res.status(200).json({ message: "Reviews fetched successfully", reviews: reviews.rows, userReview });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// API to create a new shelf in books page
app.post("/create-shelf", isAuthenticated, async (req, res) => {
  const { shelf_name } = req.body;
  const user_id = req.session.userId;

  // console.log("Shelf Name:", shelf_name);

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


app.get("/recommendations", isAuthenticated, async (req, res) => {
  const user_id = req.session.userId;
  try {
    
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

// Fetch all videos - Anushka
app.get('/videos', async (req, res) => {
  try {
    const sql = "SELECT video_id, thumbnail_url, video_link, video_name FROM videos";
    const result = await pool.query(sql);

    res.status(200).json({ videos: result.rows });
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ message: "Error fetching videos" });
  }
});

app.post("/videosinsert", async (req, res) => {
  const { video_link } = req.body;
  const user_id = req.session.userId;

  if (!video_link || !user_id) {
    return res.status(400).json({ message: "Missing video link or user not logged in" });
  }

  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${video_link}&format=json`;
    const metadataRes = await fetch(oEmbedUrl);
    if (!metadataRes.ok) throw new Error("Failed to fetch metadata from YouTube");

    const metadata = await metadataRes.json();
    const video_name = metadata.title;
    const thumbnail_url = metadata.thumbnail_url;

    const result = await pool.query(
      "INSERT INTO videos (video_link, user_id, video_name, thumbnail_url) VALUES ($1, $2, $3, $4)",
      [video_link, user_id, video_name, thumbnail_url]
    );
    // res.status(201).json(result.rows[0]);
    res.status(200).json({message: "Video added successfully!"});
  } catch (err) {
    console.error("Error adding video:", err);
    res.status(500).json({ message: "Failed to add video" });
  }
});

// author details fro author pages in community Anushka
app.get("/authors-in-community", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT author_id, name, image_link, bio FROM Authors"
    );
    res.json({ authors: result.rows });
  } catch (err) {
    console.error("Error fetching authors:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// community-bookreviews-myvideos Anushka
app.get("/myvideos", async (req, res) => {
  const user_id = req.session.userId;

  if (!user_id) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM videos WHERE user_id = $1",
      [user_id]
    );

    // if(result.rows.length === 0) {
    //   return res.status(404).json({ message: "You don't have any uploaded videos!" });
    // }

    res.status(200).json({ videos: result.rows });
  } catch (err) {
    console.error("Error fetching user videos:", err);
    res.status(500).json({ message: "Failed to fetch videos" });
  }
});

//search authors by name in community Anushka
app.get("/search-authors", async (req, res) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await pool.query(
      "SELECT author_id, name, image_link FROM Authors WHERE name ILIKE $1",
      [`%${searchQuery}%`]
    );

    return res.status(200).json({ authors: result.rows });
  } catch (error) {
    console.error("Error searching authors:", error);
    return res.status(500).json({ error: "Internal server error" });
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
    // console.log("Author ID:", authorId);
    const authorQuery = await pool.query(
      'SELECT * FROM authors WHERE author_id = $1',
      [authorId]
    );

    // console.log("Author Query:", authorQuery.rows);

    if (authorQuery.rows.length === 0) {
      return res.status(404).json({ message: "Author not found" });
    }

    const author = authorQuery.rows[0];

    // Fetch books by the author
    const booksQuery = await pool.query(
      'SELECT book_id, name, image_link, avg_rating FROM Books WHERE author_id = $1',
      [authorId - 1] // if you're storing author name strings
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
