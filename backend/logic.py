def rec_genre(genre_name, cursor):
    """
    Get book recommendations based on a specific genre
    
    Args:
        genre_name: Name of the genre to get recommendations for
        cursor: Database cursor
    
    Returns:
        List of recommended books with their scores
    """
    try:
        # First get all books in this genre with their ratings
        cursor.execute("""
            SELECT b.*, 
                   GROUP_CONCAT(DISTINCT g.genre_name) as genres,
                   COALESCE(AVG(r.rating), 0) as avg_rating
            FROM books b
            LEFT JOIN book_genres bg ON b.book_id = bg.book_id
            LEFT JOIN genres g ON bg.genre_id = g.genre_id
            LEFT JOIN ratings r ON b.book_id = r.book_id
            WHERE g.genre_name = %s
            GROUP BY b.book_id
            HAVING avg_rating > 0
            ORDER BY avg_rating DESC
            LIMIT 10
        """, (genre_name,))
        
        top_rated_books = cursor.fetchall()
        
        if not top_rated_books:
            return []
            
        # Process genres from string to list
        for book in top_rated_books:
            book['genres'] = book['genres'].split(',') if book['genres'] else []
        
        # Get all books for comparison
        cursor.execute("""
            SELECT b.*, 
                   GROUP_CONCAT(DISTINCT g.genre_name) as genres
            FROM books b
            LEFT JOIN book_genres bg ON b.book_id = bg.book_id
            LEFT JOIN genres g ON bg.genre_id = g.genre_id
            GROUP BY b.book_id
        """)
        
        all_books = cursor.fetchall()
        
        # Process genres from string to list
        for book in all_books:
            book['genres'] = book['genres'].split(',') if book['genres'] else []
        
        # Create input books list with ratings
        input_books = [
            {
                'book_id': book['book_id'],
                'rating': float(book['avg_rating'])
            }
            for book in top_rated_books
        ]
        
        # Get recommendations using our recommendation system
        from recommendation_system import get_recommendations
        recommendations = get_recommendations(input_books, all_books, top_n=20)
        
        # Filter out books that are already in the top rated list
        top_rated_ids = {book['book_id'] for book in top_rated_books}
        recommendations = [
            book for book in recommendations 
            if book['book_id'] not in top_rated_ids
        ][:10]  # Take top 10 new recommendations
        
        return recommendations
        
    except Exception as e:
        print(f"Error in rec_genre: {str(e)}")
        return [] 