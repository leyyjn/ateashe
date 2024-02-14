const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());


const db = require ('./collections/database');


const customerRouter = require('./collections/customer');
const  menuRouter = require('./collections/menu')
const employeeRouter = require('./collections/employees');
const orderRouter = require('./collections/orders');
const pickupOrderRouter = require('./collections/order_status');
const PaymentRouter = require('./collections/payment');

const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

app.use(customerRouter);
app.use( menuRouter);
app.use(employeeRouter);
app.use(orderRouter);
app.use(pickupOrderRouter);
app.use(PaymentRouter);

app.get('/api', (req, res) => {
    res.json({ message: 'Restful API Backend Using ExpressJS'});
});

app.listen(PORT, () => {
    console.log(`Server is running on https://ateashe.onrender.com/api`);
});
