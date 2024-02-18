const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory data storage
let rooms = [];
let bookings = [];
let customers = [];

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to create a room
app.post("/rooms", (req, res) => {
  const { roomName, numberOfSeats, amenities, pricePerHour } = req.body;
  const newRoom = {
    roomId: rooms.length + 1,
    roomName,
    numberOfSeats,
    amenities,
    pricePerHour,
  };
  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

// Endpoint to book a room
app.post("/bookings", (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

  // Check if the room is already booked for the specified date and time
  const existingBooking = bookings.find((booking) => {
    return (
      booking.roomId === roomId &&
      booking.date === date &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime))
    );
  });

  // If a booking already exists for the room and time slot, return an error response
  if (existingBooking) {
    return res
      .status(400)
      .json({ error: "Room already booked for the specified date and time." });
  }

  // If the room is available, proceed with creating the booking
  const newBooking = {
    bookingId: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    bookingDate: new Date(),
    bookingStatus: "Confirmed",
  };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// Endpoint to list all rooms with booked data
app.get("/rooms", (req, res) => {
  const roomsWithBookedData = rooms.map((room) => {
    const bookingsForRoom = bookings.filter(
      (booking) => booking.roomId === room.roomId
    );
    return {
      ...room,
      bookings: bookingsForRoom,
    };
  });
  res.json(roomsWithBookedData);
});

// Endpoint to list all customers with booked data
app.get("/customers", (req, res) => {
  const customersWithBookedData = customers.map((customer) => {
    const bookingsForCustomer = bookings.filter(
      (booking) => booking.customerId === customer.customerId
    );
    return {
      ...customer,
      bookings: bookingsForCustomer,
    };
  });
  res.json(customersWithBookedData);
});

// Endpoint to list booking details for a customer
app.get("/customers/:customerId/bookings", (req, res) => {
  const customerId = req.params.customerId;
  const bookingsForCustomer = bookings.filter(
    (booking) => booking.customerId === customerId
  );
  res.json(bookingsForCustomer);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
