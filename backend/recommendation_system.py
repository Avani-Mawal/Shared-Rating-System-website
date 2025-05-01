import numpy as np
from typing import List, Dict, Tuple
import json
from collections import defaultdict

class BookRecommender:
    def __init__(self):
        self.book_features = {}  # Store book features
        self.similarity_matrix = {}  # Cache for book similarities
        self.books_data = {}  # Store all books data

    def load_books_data(self, books_data: List[Dict]):
        """Load and preprocess books data"""
        for book in books_data:
            self.books_data[book['book_id']] = book
            # Create feature vector for each book
            self.book_features[book['book_id']] = {
                'genres': set(book.get('genres', [])),
                'author_id': book.get('author_id'),
                'language': book.get('lang_code'),
                'year': book.get('publ_date', '').split('-')[0] if book.get('publ_date') else None
            }

    def calculate_book_similarity(self, book1_id: int, book2_id: int) -> float:
        """Calculate similarity score between two books"""
        if book1_id == book2_id:
            return 0.0

        # Check cache first
        cache_key = tuple(sorted([book1_id, book2_id]))
        if cache_key in self.similarity_matrix:
            return self.similarity_matrix[cache_key]

        features1 = self.book_features[book1_id]
        features2 = self.book_features[book2_id]

        # Calculate similarity scores for different features
        genre_similarity = len(features1['genres'] & features2['genres']) / \
                         max(len(features1['genres'] | features2['genres']), 1)
        
        author_similarity = 1.0 if features1['author_id'] == features2['author_id'] else 0.0
        
        language_similarity = 1.0 if features1['language'] == features2['language'] else 0.0
        
        year_similarity = 0.0
        if features1['year'] and features2['year']:
            year_diff = abs(int(features1['year']) - int(features2['year']))
            year_similarity = 1.0 / (1.0 + year_diff/10)  # Decay similarity based on year difference

        # Weighted sum of similarities
        similarity = (
            0.4 * genre_similarity +
            0.3 * author_similarity +
            0.1 * language_similarity +
            0.2 * year_similarity
        )

        # Cache the result
        self.similarity_matrix[cache_key] = similarity
        return similarity

    def get_recommendations(self, input_books: List[Dict], top_n: int = 10) -> List[Dict]:
        """
        Get book recommendations based on input books and their ratings
        
        Args:
            input_books: List of dictionaries containing book_id and rating
            top_n: Number of recommendations to return
        
        Returns:
            List of recommended books with their scores
        """
        if not input_books:
            return []

        # Calculate weighted scores for all books
        book_scores = defaultdict(float)
        total_weight = sum(book['rating'] for book in input_books)

        # For each input book
        for input_book in input_books:
            book_id = input_book['book_id']
            rating = input_book['rating']
            weight = rating / total_weight  # Normalize weight

            # Calculate similarity with all other books
            for other_book_id in self.books_data.keys():
                if other_book_id != book_id:
                    similarity = self.calculate_book_similarity(book_id, other_book_id)
                    book_scores[other_book_id] += similarity * weight

        # Sort books by score and get top N
        recommended_books = []
        for book_id, score in sorted(book_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]:
            book_data = self.books_data[book_id].copy()
            book_data['similarity_score'] = round(score, 3)
            recommended_books.append(book_data)

        return recommended_books

def get_recommendations(input_books: List[Dict], all_books: List[Dict], top_n: int = 10) -> List[Dict]:
    """
    Main function to get book recommendations
    
    Args:
        input_books: List of dictionaries with book_id and rating
        all_books: List of all books in the database
        top_n: Number of recommendations to return
    
    Returns:
        List of recommended books with their scores
    """
    recommender = BookRecommender()
    recommender.load_books_data(all_books)
    return recommender.get_recommendations(input_books, top_n)

# Example usage:
if __name__ == "__main__":
    # Example input books with ratings
    input_books = [
        {"book_id": 1, "rating": 5.0},
        {"book_id": 2, "rating": 4.0},
        {"book_id": 3, "rating": 3.0}
    ]
    
    # Example all books data
    all_books = [
        {
            "book_id": 1,
            "name": "Book 1",
            "author_id": 1,
            "genres": ["Fiction", "Mystery"],
            "lang_code": "en",
            "publ_date": "2020-01-01"
        },
        # ... more books
    ]
    
    recommendations = get_recommendations(input_books, all_books)
    print(json.dumps(recommendations, indent=2)) 