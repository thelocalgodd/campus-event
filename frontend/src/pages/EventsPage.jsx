import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/events");
      const data = await response.json();
      console.log("Fetched events:", data); // Debug log
      setEvents(data);
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
        `http://localhost:5001/api/events/${eventId}/rsvp`,
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
        fetchEvents(); // Refresh the events list
      } else {
        const data = await response.json();
        alert(data.message || "Failed to RSVP");
      }
    } catch (error) {
      console.error("RSVP error:", error);
      alert("Failed to RSVP. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="events-page">
      <h1>All Events</h1>
      <div className="events-grid">
        {events.length === 0 ? (
          <p>No events found</p>
        ) : (
          events.map((event) => (
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
                <p className="event-description">{event.description}</p>
                <p className="event-category">Category: {event.category}</p>
                <p className="seats-left">
                  {event.capacity - (event.registeredUsers?.length || 0)} seats
                  remaining
                </p>
                {user?.isAdmin && (
                  <button
                    onClick={() => navigate(`/events/edit/${event._id}`)}
                    className="btn secondary"
                  >
                    Edit Event
                  </button>
                )}
                <button
                  className="btn primary"
                  onClick={() => handleRSVP(event._id)}
                  disabled={event.registeredUsers?.length >= event.capacity}
                >
                  RSVP Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;
