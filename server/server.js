
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Booking database structure
const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true, trim: true },
  room: { type: String, required: true, trim: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  status: { type: String, default: "Confirmed" },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model("Booking", bookingSchema);

// Test API
app.get("/", (req, res) => {
  res.json({ message: "HotelPro API is running!" });
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch bookings." });
  }
});

// Create a booking
app.post("/api/bookings", async (req, res) => {
  try {
    const { guestName, room, checkIn, checkOut } = req.body;

    if (!guestName || !room || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Please provide all booking details."
      });
    }

    const booking = await Booking.create({
      guestName,
      room,
      checkIn,
      checkOut
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Could not create booking." });
  }
});

// Delete a booking
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    res.json({ message: "Booking deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid booking ID." });
  }
});

// Connect to MongoDB, then start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    app.listen(PORT, () => {
      console.log(`HotelPro API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
