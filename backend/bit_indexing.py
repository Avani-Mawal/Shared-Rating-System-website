import psycopg2, ast

# List of genres you have
genres = ["Fiction", "Fantasy", "Audiobook", "Romance", "Young Adult", "Mystery", "Classics", "Contemporary",
          "Historical Fiction", "Book Club", "Thriller", "Nonfiction", "Science Fiction", "Adventure", "Paranormal",
          "Crime", "Literature", "Historical", "Childrens", "Mystery Thriller", "Novels", "Humor", "Suspense", "Adult",
          "Horror", "Chick Lit", "Middle Grade", "Biography", "Magic", "Science Fiction Fantasy", "Urban Fantasy",
          "Memoir", "Vampires", "Literary Fiction", "History", "High Fantasy", "Paranormal Romance", "Dystopia",
          "Philosophy", "Graphic Novels", "Realistic Fiction", "Adult Fiction", "Epic Fantasy", "Short Stories",
          "Contemporary Romance", "Comics", "Supernatural", "Psychology", "School", "Animals", "Self Help", "Comedy",
          "Biography Memoir", "Science", "Picture Books", "American", "War", "Graphic Novels Comics", "Politics",
          "Religion", "Detective", "Poetry", "Autobiography"]


# Create a lowercase mapping for case-insensitive matching
genre_to_index = {genre.lower(): idx for idx, genre in enumerate(genres)}

def calculate_genre_bitmap(genre_string):
    if not genre_string:
        return 0
    bitmap = 0

    try:
        genre_list = ast.literal_eval(genre_string)
    except Exception as e:
        print(f"Error parsing genre string: {genre_string}. Error: {e}")
        return 0

    genre_list = [g.strip().lower() for g in genre_list]
    print(genre_list)
    for genre in genre_list:
        index = genre_to_index.get(genre)
        # print(genre)
        if index is not None:
            bitmap |= (1 << index)
            # print(bitmap)
        else:
            print(f"Warning: Genre '{genre}' not found in mapping!")
    return bitmap

def bitmap_to_genres(bitmap):
    if bitmap == 0:
        return []
    genres_list = []
    for i in range(len(genres)):
        if bitmap & (1 << i):
            genres_list.append(genres[i])
    return genres_list

if __name__ == "__main__":
    # Connect to the database
    conn = psycopg2.connect(
        dbname="library",
        user="mugdha",
        password="avaniorzz",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()

    # Select all books (change query if you want to limit)
    cur.execute("SELECT book_id, genre FROM Books;")
    books = cur.fetchall()
    count = 0
    for book_id, genre_string in books:
        genre_list = ast.literal_eval(genre_string)
        genre_list = [g.strip() for g in genre_list]
        cur.execute("Update Books set base_genre = %s where book_id = %s;", (genre_list[0], book_id))

        bitmap = calculate_genre_bitmap(genre_string)
        

        # Update the book record
        update_query = "UPDATE Books SET genre_bitmap = %s WHERE book_id = %s;"
        cur.execute(update_query, (bitmap, book_id))
        count += 1

    conn.commit()
    print(f"Updated {count} books with genre_bitmap!")

    # Close connection
    cur.close()
    conn.close()
