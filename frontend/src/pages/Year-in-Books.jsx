import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "../css/year-in-books.css";
import Navbar from "../components/Navbar";
import { Link } from "react-router";
import { apiUrl } from "../config/config";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const YearInBooks = () => {
  const [yearStats, setYearStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [username, setUsername] = useState("User");
  const [year, setYear] = useState(new Date().getFullYear());
  const [pagesRead, setPagesRead] = useState(0);
  const [booksRead, setBooksRead] = useState(0);
  const [topAuthors, setTopAuthors] = useState([]);
  

  const handlePrev = () => {
    setYear(year - 1);
  };

  const handleNext = () => {
    setYear(year + 1);
  };

  const fetchDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/year-in-books/${year}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      console.log("data");  
      console.log(data);
      if (response.status === 200) {
        setPagesRead(data.pagesRead);
        setBooksRead(data.booksRead);
        setTopAuthors(data.topAuthors);
        setYearStats({
          totalBooks: data.booksRead,
          totalPages: data.pagesRead,
          averageRating: data.averageRating || 0,
          topBooks: data.topBooks || [],
          monthlyStats: data.monthlyStats || []
        });
        setLoading(false);
      } else {
        console.error("Error fetching pages read:", data.message);
        setError("Failed to load year in books data");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching pages read:", error);
      setError("Failed to load year in books data");
      setLoading(false);
    }
  };

  // Check login status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.status === 200) {
          fetchDetails();
          setUsername(data.username);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };
    checkStatus();
  }, [navigate, year]);

  const getMonthlyData = (monthlyStats) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Create a map of all months with count 0
    const monthMap = months.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});
    
    // Update the map with actual data
    monthlyStats.forEach(stat => {
      monthMap[stat.name] = stat.count;
    });
    
    // Return arrays for labels and data
    return {
      labels: months,
      data: months.map(month => monthMap[month])
    };
  };

  const getTopMonths = (monthlyStats) => {
    return [...monthlyStats]
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(stat => ({
        ...stat,
        percentage: Math.round((stat.count / yearStats.totalBooks) * 100)
      }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-text">{error}</div>
      </div>
    );
  }

  if (!yearStats) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📚</div>
        <div className="empty-state-text">No reading data available for this year</div>
        <div className="empty-state-subtext">Start reading to see your year in books!</div>
      </div>
    );
  }

  return (
    <div className="year-in-books-container">
      <Navbar />
      <div className="page-header">
        <div className="year-navigation">
          <button onClick={handlePrev} className="year-nav-button">&lt;</button>
          <h2 className="current-year">{year}</h2>
          {year !== new Date().getFullYear() && (
            <button onClick={handleNext} className="year-nav-button">&gt;</button>
          )}
        </div>
        <div className="page-title-container">
          <h1 className="page-title">My {year} in Books</h1>
          <p className="page-subtitle">A summary of your reading journey in {year}</p>
        </div>
      </div>
      
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{yearStats.totalBooks}</div>
          <div className="stat-label">Books Read</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{yearStats.totalPages}</div>
          <div className="stat-label">Pages Read</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Number(yearStats.averageRating).toFixed(1)}</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="books-section">
        <div className="section-header">
          <h2 className="section-title">Your Top Books</h2>
        </div>
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {yearStats.topBooks.map((book) => (
                <tr key={book.book_id}>
                  <td onClick={() => navigate(`/books/${book.book_id}`)}>
                    <img src={book.image_link} alt={book.name} className="book-cover-small" />
                  </td>
                  <td onClick={() => navigate(`/books/${book.book_id}`)}>{book.name}</td>
                  <td>
                    <span 
                      className="author-link" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/authors/${book.author_id}`);
                      }}
                    >
                      {book.author_name}
                    </span>
                  </td>
                  <td onClick={() => navigate(`/books/${book.book_id}`)}>
                    <div className="book-rating">
                      <span className="rating-stars">{"★".repeat(Math.round(book.rating))}</span>
                      <span className="rating-value">{book.rating.toFixed(1)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Monthly Reading Progress</h3>
        <div className="chart-content">
          <div className="chart-wrapper">
            <Line
              data={{
                labels: getMonthlyData(yearStats.monthlyStats).labels,
                datasets: [
                  {
                    label: 'Books Read',
                    data: getMonthlyData(yearStats.monthlyStats).data,
                    borderColor: 'rgb(52, 152, 219)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Books Read: ${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                    title: {
                      display: true,
                      text: 'Number of Books'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                },
              }}
            />
          </div>
          <div className="top-months">
            <h4>Top Reading Months</h4>
            <div className="top-months-list">
              {getTopMonths(yearStats.monthlyStats).map((month, index) => (
                <div key={month.name} className="top-month-item">
                  <div className="month-rank">#{index + 1}</div>
                  <div className="month-info">
                    <div className="month-name">{month.name}</div>
                    <div className="month-stats">
                      <span className="book-count">{month.count} books</span>
                      <span className="month-percentage">({month.percentage}%)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearInBooks;