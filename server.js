// server/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

let availableOrders = [];
let drivers = [];

app.get('/', (req, res) => {
  res.send('Hammal Server is running!');
});

// Create order (customer)
app.post('/api/order/create', (req, res) => {
  const { customerName, destination, vehicle, fare } = req.body;
  if (!customerName || !destination) {
    return res.status(400).json({ message: "بيانات الطلب ناقصة" });
  }
  const order = {
    id: Date.now(),
    customerName,
    destination,
    vehicle,
    fare,
    status: "pending"
  };
  availableOrders.push(order);

  // Notify all connected drivers
  io.emit('new-order', order);

  res.json({ message: "تم إرسال الطلب، في انتظار قبول السائق", order });
});

// Register driver
app.post('/api/driver/register', (req, res) => {
  const { name, wallet } = req.body;
  if (!name || !wallet) return res.status(400).json({ message: "البيانات ناقصة" });

  const driver = { id: Date.now(), name, wallet };
  drivers.push(driver);
  res.json({ message: "تم تسجيل السائق", driver });
});

// Driver accepts order
app.post('/api/order/accept', (req, res) => {
  const { driverId, orderId } = req.body;
  const order = availableOrders.find(o => o.id === orderId);
  if (!order) return res.status(404).json({ message: "الطلب غير موجود" });

  order.status = "accepted";
  order.driverId = driverId;

  // Notify all clients
  io.emit('order-accepted', order);

  res.json({ message: "تم قبول الطلب", order });
});

// Socket.IO connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send current available orders
  socket.emit('available-orders', availableOrders);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
