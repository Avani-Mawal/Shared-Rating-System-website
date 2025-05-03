import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiUrl } from "../config/config";
import Navbar from "../components/Navbar";
import "../css/Community.css";

const Bookreviews = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVideoLink, setNewVideoLink] = useState("");
  const [showMyVideos, setShowMyVideos] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${apiUrl}/videos`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        // if(response.status === 404) {
        //   setVideos([]);
        //   return;
        // }
        const data = await response.json();
        setVideos(data.videos);
      } else {
        console.error("Failed to fetch videos");
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  const fetchMyVideos = async () => {
    try {
      const response = await fetch(`${apiUrl}/myvideos`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        if (response.status === 404) {
          setVideos([]);
          return;
        }
        const data = await response.json();
        setVideos(data.videos);
      } else {
        console.error("Failed to fetch user's videos");
      }
    } catch (error) {
      console.error("Error fetching user's videos:", error);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideoLink) return;

    const newVideo = {
      video_link: newVideoLink,
    };

    try {
      const response = await fetch(`${apiUrl}/videosinsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newVideo),
      });

      if (response.ok) {
        setNewVideoLink("");
        setSuccessMessage("Video added!");

        setTimeout(() => setSuccessMessage(""), 3000);

        if (showMyVideos) {
          fetchMyVideos();
        } else {
          fetchVideos();
        }
      } else {
        console.error("Failed to add video");
      }
    } catch (error) {
      console.error("Error adding video:", error);
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
          await fetchVideos();
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking login status:", error);
        navigate("/login");
      }
    };

    checkLoginStatus();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="community-container">
      <Navbar />

      <h3>Add Your Review Video</h3>

      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleAddVideo} className="add-video-form">
        <input
          type="text"
          placeholder="YouTube link"
          value={newVideoLink}
          onChange={(e) => setNewVideoLink(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      {!showMyVideos ? (
        <button
          type="button"
          onClick={() => {
            fetchMyVideos();
            setShowMyVideos(true);
          }}
          className="my-videos-button"
        >
          MY VIDEOS
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            fetchVideos();
            setShowMyVideos(false);
          }}
          className="my-videos-button"
        >
          Show All Videos
        </button>
      )}

      <div className="community-content">
        <div className="video-grid">
          {videos.map((video) => (
            <div className="video-card" key={video.video_id}>
              <div
                className="video-thumbnail-wrapper"
                onClick={() => window.open(video.video_link, "_blank")}
              >
                <img
                  className="video-thumbnail"
                  src={video.thumbnail_url}
                  alt={video.video_name}
                />
              </div>
              <div className="video-name">
                <p>{video.video_name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bookreviews;
