// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
// import { apiUrl } from "../config/config";
// import SearchBar from "../components/SearchBar";
// import "../css/Navbar.css";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [showPopup, setShowPopup] = useState(false); // make sure this is defined
//   const [userDetails, setUserDetails] = useState({});

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });
//         if (response.status !== 200) {
//           setLoggedIn(false);
//         } else {
//           setLoggedIn(true);
//           fetchUserDetails();
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error checking login status:", error);
//         navigate("/login");
//       }
//     };

//     checkLoginStatus();
//   }, [navigate]);

//   // Fetch user details
//     const fetchUserDetails = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/user-details`, {
//           method: "GET",
//           credentials: "include",
//         });
  
//         const data = await response.json();
  
//         if (response.ok) {
//           setUserDetails(data.user);
//         } else {
//           console.error("Failed to fetch user details:", data.error);
//         }
//       } catch (error) {
//         console.error("Error fetching user details:", error);
//       }
//     };

//     // Logout function
//       const handleLogout = async () => {
//         try {
//           const response = await fetch(`${apiUrl}/logout`, {
//             method: "POST",
//             credentials: "include",
//           });
//           if (response.ok) {
//             navigate("/login");
//           } else {
//             console.error("Logout failed");
//           }
//         } catch (error) {
//           console.error("Error during logout:", error);
//         }
//       };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   const handleDropdownClick = (path) => {
//     navigate(path);
//     setShowDropdown(false);
//   };

//   return (
    
//     <nav className="navbar">
//     <div
//   style={{
//     fontSize: "2.5rem",
//     fontWeight: "bold",
//     marginTop: "-1px",
//     marginLeft: "-20px",
//     fontFamily: '"Lucida Handwriting", cursive',
//     color: "#3E2C21",
//     textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
//     cursor: "pointer"
//   }}
//   className="navbar-logo"
//   onClick={() => navigate("/")}
// >
//   BOOKHIVE
// </div>
  
//     <div
//       style={{
//         fontSize: "1rem",
//         fontWeight: "bold",
//         marginTop: "5px",
//         gap: "1px",
//         fontFamily: "'Cinzel', serif",
//       }}
//       className="navbar-links"
//     >
//       <a href="/">Home</a>
//       <a href="/myBooks">My Books</a>
//       <a href="/genres">Genre</a>
//       <a href="/recommendations">Recommendations</a>
//       <a href="/community">Community</a>
//     </div>
  
//     <div className="navbar-search">
//       <SearchBar onSearchResults={() => {}} />
//     </div>
  
//     <div className="navbar-actions" style={{ display: "flex", gap: "10px" }}>
//       {!loggedIn && (
//         <>
//           <button
//             className="login-btn"
//             onClick={() => navigate("/login")}
//             style={{
//               padding: "10px 20px",
//               background: "linear-gradient(135deg,rgb(51, 38, 26) 0%,rgb(58, 45, 34) 100%)",
//               color: "#fff",
//               border: "none",
//               borderRadius: "30px",
//               fontWeight: "bold",
//               fontSize: "1rem",
//               cursor: "pointer",
//               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//               transition: "transform 0.2s, box-shadow 0.2s",
//               marginRight: "10px"
//             }}
//             onMouseOver={(e) => {
//               e.currentTarget.style.transform = "scale(1.05)";
//               e.currentTarget.style.boxShadow =
//                 "0 6px 18px rgba(0, 0, 0, 0.3)";
//             }}
//             onMouseOut={(e) => {
//               e.currentTarget.style.transform = "scale(1)";
//               e.currentTarget.style.boxShadow =
//                 "0 4px 12px rgba(0, 0, 0, 0.2)";
//             }}
//           >
//             Login
//           </button>
  
//           <button
//             className="signup-btn"
//             onClick={() => navigate("/signup")}
//             style={{
//               padding: "10px 20px",
//               background: "linear-gradient(135deg,rgb(58, 45, 34),rgb(58, 45, 34)100%)",
//               color: "#fff",
//               border: "none",
//               borderRadius: "30px",
//               fontWeight: "bold",
//               fontSize: "1rem",
//               cursor: "pointer",
//               boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//               transition: "transform 0.2s, box-shadow 0.2s",
//             }}
//             onMouseOver={(e) => {
//               e.currentTarget.style.transform = "scale(1.05)";
//               e.currentTarget.style.boxShadow =
//                 "0 6px 18px rgba(0, 0, 0, 0.3)";
//             }}
//             onMouseOut={(e) => {
//               e.currentTarget.style.transform = "scale(1)";
//               e.currentTarget.style.boxShadow =
//                 "0 4px 12px rgba(0, 0, 0, 0.2)";
//             }}
//           >
//             Signup
//           </button>
//         </>
//       )}
  
//       {loggedIn && (
//         <div
//           style={{
//             position: "relative",
//             marginLeft: "10px",
//             marginRight: "20px",
//           }}
//         >
//           <div
//             onClick={() => setShowPopup(!showPopup)}
//             style={{
//               width: "40px",
//               height: "40px",
//               borderRadius: "50%",
//               backgroundColor: "#5A3A22",
//               color: "white",
//               fontWeight: "bold",
//               fontSize: "18px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//               userSelect: "none",
//               flexShrink: 0,
//             }}
//             title="Account"
//           >
//             A
//           </div>
//         </div>
//       )}
  
//       {showPopup && (
//         <div
//           style={{
//             position: "absolute",
//             top: "50px",
//             right: "0",
//             backgroundColor: "#fff",
//             borderRadius: "8px",
//             boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//             padding: "15px",
//             width: "220px",
//             zIndex: 10,
//           }}
//         >
//           <p style={{ margin: "5px 0" }}>
//             {userDetails.first_name || "-"} {userDetails.last_name || "-"}
//           </p>
//           <p style={{ margin: "5px 0" }}>{userDetails.email || "-"}</p>
//           <p style={{ margin: "5px 0" }}>
//             <strong>Date of Birth:</strong>{" "}
//             {userDetails.dob
//               ? new Date(userDetails.dob).toLocaleDateString()
//               : "-"}
//           </p>
//           <button
//             onClick={handleLogout}
//             style={{
//               marginTop: "10px",
//               width: "100%",
//               padding: "8px",
//               backgroundColor: "#5A3A22",
//               color: "#fff",
//               border: "none",
//               borderRadius: "5px",
//               cursor: "pointer",
//               fontWeight: "bold",
//             }}
//           >
//             Logout
//           </button>
//         </div>
//       )}
//     </div>
//   </nav>
//   );
// };

// export default Navbar;




// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router";
// import { apiUrl } from "../config/config";
// import SearchBar from "../components/SearchBar";
// import "../css/Navbar.css";

// const Navbar = () => {
//   const navigate = useNavigate();
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [showPopup, setShowPopup] = useState(false);
//   const [userDetails, setUserDetails] = useState({});
//   const fileInputRef = useRef();

//   useEffect(() => {
//     const checkLoginStatus = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/isLoggedIn`, {
//           credentials: "include",
//         });
//         if (response.status !== 200) {
//           setLoggedIn(false);
//         } else {
//           setLoggedIn(true);
//           fetchUserDetails();
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error checking login status:", error);
//         navigate("/login");
//       }
//     };

//     checkLoginStatus();
//   }, [navigate]);

//   const fetchUserDetails = async () => {
//     try {
//       const response = await fetch(`${apiUrl}/user-details`, {
//         method: "GET",
//         credentials: "include",
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setUserDetails(data.user);
//       } else {
//         console.error("Failed to fetch user details:", data.error);
//       }
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       const response = await fetch(`${apiUrl}/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (response.ok) {
//         navigate("/login");
//       } else {
//         console.error("Logout failed");
//       }
//     } catch (error) {
//       console.error("Error during logout:", error);
//     }
//   };

//   const handleProfilePicUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const formData = new FormData();
//     formData.append("profile_pic", file);

//     try {
//       const response = await fetch(`${apiUrl}/upload-profile-pic`, {
//         method: "POST",
//         body: formData,
//         credentials: "include",
//       });
//       if (response.ok) {
//         fetchUserDetails();
//       } else {
//         console.error("Failed to upload profile picture");
//       }
//     } catch (error) {
//       console.error("Error uploading profile picture:", error);
//     }
//   };

//   const handleRemoveProfilePic = async () => {
//     try {
//       const response = await fetch(`${apiUrl}/remove-profile-pic`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (response.ok) {
//         fetchUserDetails();
//       } else {
//         console.error("Failed to remove profile picture");
//       }
//     } catch (error) {
//       console.error("Error removing profile picture:", error);
//     }
//   };

//   if (loading) {
//     return <div className="loading">Loading...</div>;
//   }

//   const getInitials = () => {
//     const first = userDetails.first_name || "";
//     const last = userDetails.last_name || "";
//     return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "A";
//   };

//   return (
//     <nav className="navbar">
//       <div
//         style={{
//           fontSize: "2.5rem",
//           fontWeight: "bold",
//           marginTop: "-1px",
//           marginLeft: "-20px",
//           fontFamily: '"Lucida Handwriting", cursive',
//           color: "#3E2C21",
//           textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
//           cursor: "pointer",
//         }}
//         className="navbar-logo"
//         onClick={() => navigate("/")}
//       >
//         BOOKHIVE
//       </div>

//       <div
//         style={{
//           fontSize: "1rem",
//           fontWeight: "bold",
//           marginTop: "5px",
//           gap: "1px",
//           fontFamily: "'Cinzel', serif",
//         }}
//         className="navbar-links"
//       >
//         <a href="/">Home</a>
//         <a href="/myBooks">My Books</a>
//         <a href="/genres">Genre</a>
//         <a href="/recommendations">Recommendations</a>
//         <a href="/community">Community</a>
//       </div>

//       <div className="navbar-search">
//         <SearchBar onSearchResults={() => {}} />
//       </div>

//       <div className="navbar-actions" style={{ display: "flex", gap: "10px" }}>
//         {!loggedIn ? (
//           <>
//             <button
//               className="login-btn"
//               onClick={() => navigate("/login")}
//               style={{
//                 padding: "10px 20px",
//                 background:
//                   "linear-gradient(135deg,rgb(51, 38, 26) 0%,rgb(58, 45, 34) 100%)",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "30px",
//                 fontWeight: "bold",
//                 fontSize: "1rem",
//                 cursor: "pointer",
//                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//                 transition: "transform 0.2s, box-shadow 0.2s",
//                 marginRight: "10px",
//               }}
//               onMouseOver={(e) => {
//                 e.currentTarget.style.transform = "scale(1.05)";
//                 e.currentTarget.style.boxShadow =
//                   "0 6px 18px rgba(0, 0, 0, 0.3)";
//               }}
//               onMouseOut={(e) => {
//                 e.currentTarget.style.transform = "scale(1)";
//                 e.currentTarget.style.boxShadow =
//                   "0 4px 12px rgba(0, 0, 0, 0.2)";
//               }}
//             >
//               Login
//             </button>

//             <button
//               className="signup-btn"
//               onClick={() => navigate("/signup")}
//               style={{
//                 padding: "10px 20px",
//                 background:
//                   "linear-gradient(135deg,rgb(58, 45, 34),rgb(58, 45, 34)100%)",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "30px",
//                 fontWeight: "bold",
//                 fontSize: "1rem",
//                 cursor: "pointer",
//                 boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
//                 transition: "transform 0.2s, box-shadow 0.2s",
//               }}
//               onMouseOver={(e) => {
//                 e.currentTarget.style.transform = "scale(1.05)";
//                 e.currentTarget.style.boxShadow =
//                   "0 6px 18px rgba(0, 0, 0, 0.3)";
//               }}
//               onMouseOut={(e) => {
//                 e.currentTarget.style.transform = "scale(1)";
//                 e.currentTarget.style.boxShadow =
//                   "0 4px 12px rgba(0, 0, 0, 0.2)";
//               }}
//             >
//               Signup
//             </button>
//           </>
//         ) : (
//           <div style={{ position: "relative", marginLeft: "10px", marginRight: "20px" }}>
//             <div
//               onClick={() => setShowPopup(!showPopup)}
//               style={{
//                 width: "40px",
//                 height: "40px",
//                 borderRadius: "50%",
//                 backgroundColor: "#5A3A22",
//                 color: "white",
//                 fontWeight: "bold",
//                 fontSize: "18px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: "pointer",
//                 userSelect: "none",
//                 overflow: "hidden",
//               }}
//               title="Account"
//             >
//               {userDetails.profile_pic ? (
//                 <img
//                   src={`${apiUrl}/${userDetails.profile_pic}`}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                 />
//               ) : (
//                 getInitials()
//               )}
//             </div>

//             {showPopup && (
//               <div
//                 style={{
//                   position: "absolute",
//                   top: "50px",
//                   right: "0",
//                   backgroundColor: "#fff",
//                   borderRadius: "8px",
//                   boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
//                   padding: "15px",
//                   width: "250px",
//                   zIndex: 10,
//                 }}
//               >
//                 <p style={{ margin: "5px 0" }}>
//                   {userDetails.first_name || "-"} {userDetails.last_name || "-"}
//                 </p>
//                 <p style={{ margin: "5px 0" }}>{userDetails.email || "-"}</p>
//                 <p style={{ margin: "5px 0" }}>
//                   <strong>Date of Birth:</strong>{" "}
//                   {userDetails.dob
//                     ? new Date(userDetails.dob).toLocaleDateString()
//                     : "-"}
//                 </p>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   ref={fileInputRef}
//                   style={{ display: "none" }}
//                   onChange={handleProfilePicUpload}
//                 />
//                 <button
//                   onClick={() => fileInputRef.current.click()}
//                   style={{
//                     marginTop: "10px",
//                     width: "100%",
//                     padding: "8px",
//                     backgroundColor: "#5A3A22",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Upload Photo
//                 </button>
//                 {userDetails.profile_pic && (
//                   <button
//                     onClick={handleRemoveProfilePic}
//                     style={{
//                       marginTop: "10px",
//                       width: "100%",
//                       padding: "8px",
//                       backgroundColor: "#a00",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "5px",
//                       cursor: "pointer",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     Remove Photo
//                   </button>
//                 )}
//                 <button
//                   onClick={handleLogout}
//                   style={{
//                     marginTop: "10px",
//                     width: "100%",
//                     padding: "8px",
//                     backgroundColor: "#5A3A22",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: "5px",
//                     cursor: "pointer",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import SearchBar from "../components/SearchBar";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/isLoggedIn`, {
          credentials: "include",
        });
        if (response.status !== 200) {
          setLoggedIn(false);
        } else {
          setLoggedIn(true);
          fetchUserDetails();
        }
        setLoading(false);
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/user-details`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setUserDetails(data.user);
      } else {
        console.error("Failed to fetch user details:", data.error);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${apiUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      const response = await fetch(`${apiUrl}/upload-profile-pic`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails((prev) => ({ ...prev, profile_pic: data.profile_pic }));
      } else {
        console.error("Profile picture upload failed");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const getInitials = () => {
    const first = userDetails.first_name?.charAt(0).toUpperCase() || "";
    const last = userDetails.last_name?.charAt(0).toUpperCase() || "";
    return first + last;
  };


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const handleDropdownClick = (path) => {
    navigate(path);
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginTop: "-1px",
          marginLeft: "-20px",
          fontFamily: '"Lucida Handwriting", cursive',
          color: "#3E2C21",
          textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
          cursor: "pointer"
        }}
      >
        BOOKHIVE
      </div>

      {/* <div className="navbar-links" style={{
        fontSize: "1rem",
        fontWeight: "bold",
        marginTop: "5px",
        gap: "1px",
        fontFamily: "'Cinzel', serif",
      }}>
        <a href="/">Home</a>
        <a href="/myBooks">My Books</a>
        <a href="/genres">Genre</a>
        <a href="/recommendations">Recommendations</a>
        <span
          // className="dropdown-title"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          Community ▾
        </span>
        {showDropdown && (
          // <div className="dropdown-content">
          <div>
            <p onClick={() => handleDropdownClick("/community/book-reviews")}>Book Reviews</p>
            <p onClick={() => handleDropdownClick("/community/authors")}>Authors</p>
          </div>
        )}
      </div> */}

      <div className="navbar-links">
        <a href="/">Home</a>
        <a href="/myBooks">My Books</a>
        <a href="/genres">Genre</a>
        <a href="/recommendations">Recommendations</a>
        <div
          className="navbar-link dropdown-trigger"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          Community ▾
          {showDropdown && (
            <div className="dropdown-box">
              <p onClick={() => handleDropdownClick("/Bookreviews")}>
                Book Reviews
              </p>
              <p onClick={() => handleDropdownClick("/communityauthors")}>
                Authors
              </p>
            </div>
          )}
        </div>

        
      </div>

      <div className="navbar-search">
        <SearchBar onSearchResults={() => {}} />
      </div>

      <div className="navbar-actions" style={{ display: "flex", gap: "10px" }}>
        {!loggedIn ? (
          <>
            <button className="login-btn" onClick={() => navigate("/login")}
              style={buttonStyle}>
              Login
            </button>
            <button className="signup-btn" onClick={() => navigate("/signup")}
              style={buttonStyle}>
              Signup
            </button>
          </>
        ) : (
          <div style={{ position: "relative", marginLeft: "10px", marginRight: "20px" }}>
            <div
              onClick={() => setShowPopup(!showPopup)}
              onDoubleClick={handleProfileClick}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#5A3A22",
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                userSelect: "none",
                flexShrink: 0,
                overflow: "hidden"
              }}
              title="Double click to upload profile picture"
            >
              {userDetails.profile_pic ? (
                <img
                  src={`${apiUrl}/uploads/${userDetails.profile_pic}`}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                getInitials()
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {showPopup && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: "0",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              padding: "15px",
              width: "220px",
              zIndex: 10,
            }}
          >
            <p style={{ margin: "5px 0" }}>
              {userDetails.first_name || "-"} {userDetails.last_name || "-"}
            </p>
            <p style={{ margin: "5px 0" }}>{userDetails.email || "-"}</p>
            <p style={{ margin: "5px 0" }}>
              <strong>Date of Birth:</strong>{" "}
              {userDetails.dob
                ? new Date(userDetails.dob).toLocaleDateString()
                : "-"}
            </p>
            <button
              onClick={handleLogout}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px",
                backgroundColor: "#5A3A22",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  background: "linear-gradient(135deg,rgb(51, 38, 26),rgb(58, 45, 34))",
  color: "#fff",
  border: "none",
  borderRadius: "30px",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.2s, box-shadow 0.2s",
};

export default Navbar;



