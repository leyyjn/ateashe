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

router.post('/api/postpayment', async (req, res) => {
    try {
      const { customer_id, order_id, amount, payment_type } = req.body;

      const insertPaymentQuery = 'INSERT INTO payments (customer_id, order_id, amount, payment_type) VALUES (?, ?, ?, ?)';
      await db.promise().execute(insertPaymentQuery, [customer_id, order_id, amount, payment_type]);
  
      res.status(201).json({ message: 'Order registered successfully' });
    } catch (error) {
     
        console.error('Error registering order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //GET ALL
router.get('/api/payments', authenticateToken, (req, res) => {

    try {

        db.query('SELECT payment_id, customer_id, order_id, amount, paymentdate, payment_type FROM payments', (err, result) =>{
            
            if(err){
                console.error('Error fetching payments:', err);
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
router.get('/api/payment/:id', authenticateToken, async (req, res) => {

    let payment_id = req.params.id;

    if (!payment_id) {
        return res.status(400).json({ error: true, message: 'Please provide order status ID' });
    }

    try {

        // Query to fetch customer by ID
        db.query('SELECT payment_id, customer_id, order_id, amount, paymentdate, payment_type FROM payments WHERE payment_id = ?', payment_id, (err, result) => {

            if (err) {
                console.error('Error fetching payment:', err);
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
router.put('/api/payment/:id', async (req, res) => {
    let payment_id = req.params.id;

    const { customer_id, order_id, amount, payment_type } = req.body;

    if (!customer_id || !order_id || !amount || !payment_type ) {
        return res.status(400).send({ error: user, message: 'Please provide customer_id, order_id, amount, payment_type' });
    }

    try {
        db.query('UPDATE payments SET customer_id = ?, order_id = ?, amount = ?, payment_type = ? WHERE payment_id = ?', [customer_id, order_id, amount, payment_type, payment_id], (err, result, fields) => {
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
router.delete('/api/payment/:id', async (req, res) => {

    let payment_id = req.params.id;

    if (!payment_id) {
        return res.status(400).send({ error: true, message: 'provide  pickuporder_id'});
    }

    try{
        db.query('DELETE FROM payments WHERE payment_id = ?', payment_id, (err, result, fields) => {

            if(err) {
                console.error('Error deleting payment:', err);
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