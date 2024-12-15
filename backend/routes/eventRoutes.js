const express = require('express');
const pool = require('../db');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Create a new event (Admin only)
router.post('/', async (req, res) => {
    const { name, date, time, location, capacity, seatsAvailable } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO events (name, date, time, location, capacity, seats_available) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, date, time, location, capacity, seatsAvailable]
        );
        res.status(201).json({ message: 'Event created successfully!', event: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
