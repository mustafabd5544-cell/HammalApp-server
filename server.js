const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let orders = [];

app.post('/create-order', (req, res) => {
  const order = {
    id: orders.length + 1,
    ...req.body,
    status: 'pending'
  };
  orders.push(order);
  console.log('New order:', order);

  // محاكاة قبول من سائق وهمي بعد 2 ثانية
  setTimeout(() => {
    order.status = 'accepted';
    order.driver = { name: 'سائق وهمي', vehicle: order.vehicle };
    console.log('Order accepted (sim):', order);
  }, 2000);

  res.json({ ok: true, order });
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
