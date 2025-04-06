import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genreInput, setGenreInput] = useState("");
  const [genreSuggestions, setGenreSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allGenres = [
    "Thriller", "Mystery", "Fantasy", "Romance", 
    "Science Fiction", "Non-Fiction", "Historical Fiction",
    "Horror", "Biography", "Young Adult", "Children's",
    "Adventure", "Crime", "Dystopian", "Classics"
  ];

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        if (response.status === 200) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };
    checkStatus();
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    genres: [],
    dob: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleGenreInputChange = (e) => {
    const value = e.target.value;
    setGenreInput(value);
    
    if (value.length > 0) {
      const filtered = allGenres.filter(genre =>
        genre.toLowerCase().includes(value.toLowerCase())
      );
      setGenreSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setGenreSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addGenre = (genre) => {
    if (!formData.genres.includes(genre)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, genre]
      }));
    }
    setGenreInput("");
    setGenreSuggestions([]);
    setShowSuggestions(false);
  };

  const removeGenre = (genreToRemove) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    setSlideDirection('left');
    setStep(2);
  };

  const handleBack = (e) => {
    e.preventDefault();
    setSlideDirection('right');
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try { 
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 200) {
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(errorData.message);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <Navbar />
      <div className="signup-container">
        <div className={`signup-card ${slideDirection}`}>
          {step === 1 ? (
            <div className="form-step">
              <h2>Create Your Account</h2>
              <form onSubmit={handleNext}>
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Enter your username"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
                  />
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Loading...' : 'Continue'}
                </button>
              </form>
              <p className="login-prompt">
                Already have an account? <a href="/login">Login here</a>
              </p>
            </div>
          ) : (
            <div className="form-step">
              <h2>Tell Us More About You</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Favorite Genres</label>
                  <div className="genre-input-container">
                    <input
                      type="text"
                      value={genreInput}
                      onChange={handleGenreInputChange}
                      placeholder="Search for genres..."
                      className="genre-search-input"
                    />
                    {showSuggestions && genreSuggestions.length > 0 && (
                      <ul className="genre-suggestions">
                        {genreSuggestions.map(genre => (
                          <li 
                            key={genre} 
                            onClick={() => addGenre(genre)}
                            className="suggestion-item"
                          >
                            {genre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="selected-genres">
                    {formData.genres.map(genre => (
                      <span key={genre} className="genre-tag">
                        {genre}
                        <button 
                          type="button" 
                          onClick={() => removeGenre(genre)}
                          className="remove-genre"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="back-btn" 
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting || formData.genres.length === 0}
                  >
                    {isSubmitting ? 'Signing Up...' : 'Complete Sign Up'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;