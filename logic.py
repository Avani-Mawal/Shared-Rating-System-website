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

app = Flask(__name__)
CORS(app)  # This will allow all domains to access your API

# Database connection parameters
DB_PARAMS = {
    'dbname': 'books',
    'user': 'postgres',
    'password': 'apple',
    'host': 'localhost',
    'port': '5432'
}

def load_data_from_db():
    try:
        # Create SQLAlchemy engine
        engine = create_engine(f'postgresql://{DB_PARAMS["user"]}:{DB_PARAMS["password"]}@{DB_PARAMS["host"]}:{DB_PARAMS["port"]}/{DB_PARAMS["dbname"]}')
        # Read data from database
        query = "SELECT books.name, authors.name as author, description, book_id, genre FROM books, authors WHERE books.author_id + 1 = authors.author_id"  # Adjust table name as needed
        df = pd.read_sql(query, engine)
        
        # Save to CSV
        df.to_csv("books_with_authors.csv", index=False)
        print("Data successfully loaded from database and saved to CSV")
        return df
    except Exception as e:
        print(f"Error loading data from database: {str(e)}")
        return None



# Load data from database and save to CSV

# df = load_data_from_db()
df = pd.read_csv("books_with_authors.csv")

# Convert genre string to list and get first element
df['genre'] = df['genre'].apply(lambda x: eval(x)[0] if isinstance(x, str) else x)
genres = df['genre']

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

# Applying all the functions in description and storing as a cleaned_desc
df['description'] = df['description'].fillna('')
df['cleaned_desc'] = df['description'].apply(_removeNonAscii)
df['cleaned_desc'] = df.cleaned_desc.apply(func = make_lower_case)
df['cleaned_desc'] = df.cleaned_desc.apply(func = remove_stop_words)
df['cleaned_desc'] = df.cleaned_desc.apply(func=remove_punctuation)
df['cleaned_desc'] = df.cleaned_desc.apply(func=remove_html)



df['cleaned_desc'] = df['cleaned_desc'].fillna('')


@app.route('/recommend', methods=['GET'])
def rec_desc(title=None, genre=None):
    global rec
    # Matching the genre with the dataset and reset the index
    if not title:
        title = request.args.get('title')
    if not genre:
        genre = request.args.get('genre')
    data = df.loc[df['genre'] == genre]  
    data.reset_index(level = 0, inplace = True) 
  
    # Convert the index into series
    indices = pd.Series(data.index, index = data['name'])
    
    tf = TfidfVectorizer(analyzer='word', ngram_range=(2, 2), min_df = 1, stop_words='english')
    # Load the model
   
    tfidf_matrix = tf.fit_transform(data['cleaned_desc'])
    
    # Calculating the similarity measures based on Cosine Similarity
    sg = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    # Get the index corresponding to original_title
    print("Title : " , title , " Genre : ", genre)
       
    idx = indices[title]# Get the pairwsie similarity scores 
    sig = list(enumerate(sg[idx]))# Sort the books
    sig = sorted(sig, key=lambda x: x[1], reverse=True)# Scores of the 5 most similar books 
    sig = sig[1:6]# Book indicies
    movie_indices = [i[0] for i in sig]
   
    # Top 5 book recommendation
    rec = data[['name', 'book_id']].iloc[movie_indices]
    
    result = (rec['book_id']).to_list()
    print(result)

    return jsonify(result)

@app.route('/reccomendation-from-books', methods=['GET'])
def rec_genre():
    global rec
    book_titles = request.args.get('book_titles')
    genres = request.args.get('genres')
    
    
    

if __name__ == '__main__':
    app.run(debug=True)