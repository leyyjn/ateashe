const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());

const secretKey = 'harley-secret-key';

const db = require ('./database');
const {authenticateToken} = require('../collections/authentication');

router.post('/api/order', async (req, res) => {
    try {
      const { customer_id, employee_id, pickupDate, pickupTime,  menu_id, totalAmount } = req.body;

      const insertOrderQuery = 'INSERT INTO orders (customer_id, employee_id, pickupDate, pickupTime,  menu_id, totalAmount) VALUES (?, ?, ?, ?, ?, ?)';
      await db.promise().execute(insertOrderQuery, [customer_id, employee_id, pickupDate, pickupTime,  menu_id, totalAmount]);
  
      res.status(201).json({ message: 'Order registered successfully' });
    } catch (error) {
     
        console.error('Error registering order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //GET ALL
router.get('/api/orders', authenticateToken, (req, res) => {

    try {

        // Query to fetch customers
        db.query('SELECT order_id, customer_id, employee_id,  menu_id, orderdate, pickupDate, pickupTime, totalAmount FROM orders', (err, result) =>{
            
            if(err){
                console.error('Error fetching orders:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });

    } catch (error) {
        
        console.error('Error loading orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
});

//GET ID
router.get('/api/order/:id', authenticateToken, async (req, res) => {

    let order_id = req.params.id;

    if (!order_id) {
        return res.status(400).json({ error: true, message: 'Please provide order ID' });
    }

    try {

        // Query to fetch customer by ID
        db.query('SELECT order_id, customer_id, employee_id,  menu_id, orderdate, pickupDate, pickupTime, totalAmount FROM orders WHERE order_id = ?', order_id, (err, result) => {

            if (err) {
                console.error('Error fetching orders:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ message: 'order not found' });
                } else {
                    res.status(200).json(result[0]);
                }
            }
        });

    } catch (error) {

        console.error('Error loading order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//UPDATE
router.put('/api/order/:id', async (req, res) => {
    let order_id = req.params.id;

    const { customer_id, employee_id, menu_id, pickupDate, pickupTime, totalAmount} = req.body;

    if (!customer_id|| !employee_id || ! menu_id || !pickupDate || !pickupTime || !totalAmount) {
        return res.status(400).send({ error: user, message: 'Please provide customer_id, employee_id, menu_id, pickupDate, pickupTime, and totalAmount' });
    }

    try {
        db.query('UPDATE orders SET customer_id = ?, employee_id = ?,  menu_id = ?, pickupDate = ?, pickupTime = ?, totalAmount = ? WHERE order_id = ?', [customer_id, employee_id, menu_id, pickupDate, pickupTime, totalAmount, order_id], (err, result, fields) => {
            if (err) {
                console.error('Error updating item:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading order:', error);
        res.status(500).json({ error: 'Internal Server order' });
    }
});

//DELETE
router.delete('/api/order/:id', async (req, res) => {

    let order_id = req.params.id;

    if (!order_id) {
        return res.status(400).send({ error: true, message: 'provide  order_id'});
    }

    try{
        db.query('DELETE FROM orders WHERE order_id = ?', order_id, (err, result, fields) => {

            if(err) {
                console.error('Error deleting orders:', err);
                res.status(500).json({ message: 'Internal Server Error'});
            } else {
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

module.exports = router