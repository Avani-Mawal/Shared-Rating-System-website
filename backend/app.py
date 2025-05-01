from recommendation_system import get_recommendations

@app.route('/api/recommendations', methods=['POST'])
def get_book_recommendations():
    try:
        data = request.get_json()
        input_books = data.get('books', [])  # List of {book_id, rating}
        
        # Get all books from database
        cursor = mysql.connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT b.*, GROUP_CONCAT(g.genre_name) as genres
            FROM books b
            LEFT JOIN book_genres bg ON b.book_id = bg.book_id
            LEFT JOIN genres g ON bg.genre_id = g.genre_id
            GROUP BY b.book_id
        """)
        all_books = cursor.fetchall()
        
        # Process genres from string to list
        for book in all_books:
            book['genres'] = book['genres'].split(',') if book['genres'] else []
        
        # Get recommendations
        recommendations = get_recommendations(input_books, all_books)
        
        return jsonify({
            'status': 'success',
            'recommendations': recommendations
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500 