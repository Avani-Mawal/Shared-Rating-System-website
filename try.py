import json
import pickle
import pandas as pd
import numpy as np
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import RegexpTokenizer
import re
import nltk
from PIL import Image
import requests
from io import BytesIO
from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from sqlalchemy import create_engine
# Function for removing NonAscii characters
def _removeNonAscii(s):
    return "".join(i for i in s if  ord(i)<128)

# Function for converting into lower case
def make_lower_case(text):
    return text.lower()

# Function for removing stop words
def remove_stop_words(text):
    text = text.split()
    stops = set(stopwords.words("english"))
    text = [w for w in text if not w in stops]
    text = " ".join(text)
    return text

# Function for removing punctuation
def remove_punctuation(text):
    tokenizer = RegexpTokenizer(r'\w+')
    text = tokenizer.tokenize(text)
    text = " ".join(text)
    return text

# Function for removing the html tags
def remove_html(text):
    html_pattern = re.compile('<.*?>')
    return html_pattern.sub(r'', text)

df = pd.read_csv("books_with_authors.csv")
df['description'] = df['description'].fillna('')
# Applying all the functions in description and storing as a cleaned_desc
df['description'] = df['description'].fillna('')
df['cleaned_desc'] = df['description'].apply(_removeNonAscii)
df['cleaned_desc'] = df.cleaned_desc.apply(func = make_lower_case)
df['cleaned_desc'] = df.cleaned_desc.apply(func = remove_stop_words)
df['cleaned_desc'] = df.cleaned_desc.apply(func=remove_punctuation)
df['cleaned_desc'] = df.cleaned_desc.apply(func=remove_html)


df['cleaned_desc'] = df['cleaned_desc'].fillna('')

# Convert genre string to list and get first element
df['genre'] = df['genre'].apply(lambda x: eval(x)[0] if isinstance(x, str) else x)
genres = df['genre']

def rec_from_books(book_names = None, book_genres = None, book_ratings = None):
    if not book_names:
        book_names = request.args.getlist('book_names[]')
    if not book_genres:
        book_genres = request.args.getlist('book_genres[]')
    if not book_ratings:
        book_ratings = request.args.getlist('book_ratings[]')
        book_ratings = [float(r) for r in book_ratings]

    # Create a temporary user profile based on input books
    temp_user_profile = pd.DataFrame({
        'name': book_names,
        'genre': book_genres,
        'rating': book_ratings
    })

    # Initialize similarity scores for all books
    book_scores = pd.DataFrame()
    
    # For each input book, find similar books
    for idx, user_book in temp_user_profile.iterrows():
        # Filter books by genre
        genre_books = df[df['genre'] == user_book['genre']]
        
        if len(genre_books) > 0:
            # Calculate TF-IDF for descriptions
            tf = TfidfVectorizer(analyzer='word', ngram_range=(2, 2), min_df=1, stop_words='english')
            tfidf_matrix = tf.fit_transform(genre_books['cleaned_desc'])
            
            # Calculate similarity
            sim_scores = cosine_similarity(tfidf_matrix, tfidf_matrix)
            
            # Get book index
            book_idx = genre_books[genre_books['name'] == user_book['name']].index[0]
            
            # Get similarity scores for this book
            book_sims = pd.DataFrame({
                'book_id': genre_books['book_id'],
                'name': genre_books['name'],
                'similarity': sim_scores[genre_books.index.get_loc(book_idx)],
                'rating_weight': user_book['rating'] / 5.0  # Normalize rating to 0-1
            })
            
            # Weight similarity by user rating
            book_sims['weighted_score'] = book_sims['similarity'] * book_sims['rating_weight']
            
            # Append to overall scores
            book_scores = pd.concat([book_scores, book_sims])

    # Group by book_id and take max score if book appears multiple times
    book_scores = book_scores.groupby(['book_id', 'name'])['weighted_score'].max().reset_index()
    
    # Sort by weighted score and get top 20
    recommended_books = book_scores.sort_values('weighted_score', ascending=False)
    
    # Remove input books from recommendations
    recommended_books = recommended_books[~recommended_books['name'].isin(book_names)]
    
    # Get top 20 book IDs
    result = recommended_books['book_id'].head(20).tolist()

    return jsonify(result)

if __name__ == "__main__":
    rec_from_books(book_names = ["Elantris", "The Skull Throne"], book_genres=['Fantasy', 'Fantasy'], book_ratings = [5,1])
