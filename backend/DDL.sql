DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Books CASCADE;
DROP TABLE IF EXISTS Authors CASCADE;
DROP TABLE IF EXISTS UserBooks CASCADE;
DROP TABLE IF EXISTS Bookshelves CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    -- genres TEXT NOT NULL, -- Comma-separated list of preferred genres
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    dob DATE NOT NULL
);


CREATE TABLE Books (
    book_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author_id VARCHAR(255) NOT NULL, -- Comma-separated list of author IDs
    avg_rating DECIMAL(3,1) NOT NULL,
    publ_date TEXT NOT NULL,
    isbn CHAR(13) NOT NULL,
    lang_code CHAR(2) ,
    genre VARCHAR(255),
    num_pages INT ,
    rating_count INT NOT NULL,
    review_count INT NOT NULL,
    publisher VARCHAR(255) ,
    image_link TEXT NOT NULL,
    description TEXT
    -- UNIQUE (isbn)
);

CREATE TABLE Authors (
    author_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    image_link TEXT 
);

CREATE TABLE UserBooks (
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    date_read DATE,
    date_added DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

CREATE TABLE Bookshelves (
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    shelf_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, book_id, shelf_name),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

CREATE TABLE Reviews(
    review_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Books(book_id) ON DELETE CASCADE
);

