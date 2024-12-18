import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/HomePage.css";

const API_URL = "http://localhost:5004";

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/events`);
      const data = await response.json();
      // Get the 3 most recent events
      setFeaturedEvents(data.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    if (!user) {
      alert("Please login to RSVP for events");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        alert("RSVP successful!");
        // Refresh events to update the UI
        fetchFeaturedEvents();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to RSVP");
      }
    } catch (error) {
      console.error("RSVP error:", error);
      alert("Failed to RSVP. Please try again.");
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Sharon's Campus Events Hub</h1>
          <p>Discover, Join, and Experience Amazing Campus Events</p>
          <div className="cta-buttons">
            <Link to="/events" className="btn primary">
              View Events
            </Link>
            {!user && (
              <Link to="/register" className="btn secondary">
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="upcoming-events">
        <h2>Featured Events</h2>
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : (
          <div className="events-grid">
            {featuredEvents.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-image">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} />
                  ) : (
                    <div className="placeholder-image" />
                  )}
                  <div className="event-date">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
                <div className="event-details">
                  <h3>{event.title}</h3>
                  <p className="event-info">
                    <span>📍 {event.location}</span>
                    <span>⏰ {event.time}</span>
                  </p>
                  <p className="seats-left">
                    {event.capacity - (event.registeredUsers?.length || 0)}{" "}
                    seats remaining
                  </p>
                  <button
                    className="btn primary"
                    onClick={() => handleRSVP(event._id)}
                    disabled={event.registeredUsers?.length >= event.capacity}
                  >
                    RSVP Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="mobile-menu-btn">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  );
};

export default HomePage;
