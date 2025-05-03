// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
// import { apiUrl } from "../config/config";
// import Navbar from "../components/Navbar";
// import "../css/Community.css";

// const CommunityAuthors = () => {
//   const navigate = useNavigate();
//   const [authors, setAuthors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [authorQuery, setAuthorQuery] = useState("");

//   const fetchAuthors = async () => {
//     try {
//       const response = await fetch(`${apiUrl}/authors-in-community`, {
//         method: "GET",
//         credentials: "include",
//       });      
//       if (response.ok) {
//         const data = await response.json();
//         setAuthors(data.authors);
//       } else {
//         console.error("Failed to fetch authors");
//       }
//     } catch (error) {
//       console.error("Error fetching authors:", error);
//     }
//   };

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });
//         if (response.status !== 200) {
//           navigate("/login");
//         } else {
//           await fetchAuthors();
//           setLoading(false);
//         }
//       } catch (error) {
//         console.error("Error checking login status:", error);
//         navigate("/login");
//       }
//     };

//     checkLoginStatus();
//   }, [navigate]);

//   const handleAuthorClick = (authorId) => {
//     navigate(`/authors/${authorId}`);
//   };

//   const handleauthorSearch = (e) => {
//     e.preventDefault();
//     alert(`Searching for author: ${authorQuery}`);
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   return (
//     <div className="community-container">
//       <Navbar />
//       <form onSubmit={handleauthorSearch} className="author-search-form">
//             <input
//               type="text"
//               value={authorQuery}
//               onChange={(e) => setAuthorQuery(e.target.value)}
//               placeholder="Find author by name"
//             />
//             <button type="submit">Find Author</button>
//       </form>
//       <div className="author-grid">
//         {authors.map((author) => (
//           <div
//             className="author-card"
//             key={author.author_id}
//             onClick={() => handleAuthorClick(author.author_id)}
//             style={{ cursor: "pointer" }}
//           >
//             <img
//               className="author-image"
//               src={author.image_url}
//               alt={author.name}
//             />
//             <div className="author-name">{author.name}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CommunityAuthors;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Community.css";

const CommunityAuthors = () => {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorQuery, setAuthorQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const fetchAuthors = async () => {
    try {
      const response = await fetch(`${apiUrl}/authors-in-community`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors);
      } else {
        console.error("Failed to fetch authors");
      }
    } catch (error) {
      console.error("Error fetching authors:", error);
    }
  };

  const searchAuthors = async (query) => {
    try {
      const response = await fetch(`${apiUrl}/search-authors?q=${encodeURIComponent(query)}`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setAuthors(data.authors);
        setIsSearching(true);
      } else {
        console.error("Search failed");
      }
    } catch (error) {
      console.error("Error searching authors:", error);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.status !== 200) {
          navigate("/login");
        } else {
          await fetchAuthors();
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const handleAuthorClick = (authorId) => {
    navigate(`/authors/${authorId}`);
  };

  const handleAuthorSearch = async (e) => {
    e.preventDefault();
    if (authorQuery.trim() === "") {
      await fetchAuthors(); // Reset if input is empty
      setIsSearching(false);
    } else {
      await searchAuthors(authorQuery);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="community-container">
      <Navbar />

      <form onSubmit={handleAuthorSearch} className="author-search-form">
        <input
          type="text"
          value={authorQuery}
          onChange={(e) => setAuthorQuery(e.target.value)}
          placeholder="Find author by name"
        />
        <button type="submit">Find Author</button>
        {isSearching && (
          <button
            type="button"
            onClick={() => {
              setAuthorQuery("");
              fetchAuthors();
              setIsSearching(false);
            }}
            className="reset-button"
          >
            Show All
          </button>
        )}
      </form>

      <div className="author-grid">
        {authors.length > 0 ? (
          authors.map((author) => (
            <div
              className="author-card"
              key={author.author_id}
              onClick={() => handleAuthorClick(author.author_id)}
              style={{ cursor: "pointer" }}
            >
              <img
                className="author-image"
                src={author.image_link}
                alt={author.name}
              />
              <div className="author-name">{author.name}</div>
            </div>
          ))
        ) : (
          <p>No authors found.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityAuthors;
