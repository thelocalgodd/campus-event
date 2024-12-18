import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/users/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user events");
        }

        const data = await response.json();
        setUserEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserEvents();
    }
  }, [user]);

  const handleCancelRSVP = async (eventId) => {
    if (!confirm("Are you sure you want to cancel your RSVP?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the event from the list
        setUserEvents(userEvents.filter((event) => event._id !== eventId));
        alert("RSVP cancelled successfully");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to cancel RSVP");
      }
    } catch (error) {
      console.error("Error cancelling RSVP:", error);
      alert("Failed to cancel RSVP. Please try again.");
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account and events</p>
      </div>

      <div className="content-container">
        <div className="profile-section">
          <h2>Profile Information</h2>
          <div className="profile-info">
            <div className="info-group">
              <label>Name</label>
              <p>{user?.fullName}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
            <div className="info-group">
              <label>Account Type</label>
              <p>{user?.isAdmin ? "Administrator" : "User"}</p>
            </div>
          </div>
        </div>

        <div className="events-section">
          <h2>My RSVP'd Events</h2>
          {userEvents.length === 0 ? (
            <p className="no-events">You haven't RSVP'd to any events yet.</p>
          ) : (
            <div className="events-grid">
              {userEvents.map((event) => (
                <div key={event._id} className="event-card">
                  <div className="event-image">
                    {event.imageUrl && (
                      <img src={event.imageUrl} alt={event.title} />
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
                    <button
                      className="btn secondary"
                      onClick={() => handleCancelRSVP(event._id)}
                    >
                      Cancel RSVP
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
