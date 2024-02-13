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

router.post('/api/orderstatus', async (req, res) => {
    try {
      const { order_id, status } = req.body;

      const insertOrderStatusQuery = 'INSERT INTO order_status (order_id, status) VALUES (?, ?)';
      await db.promise().execute(insertOrderStatusQuery, [order_id, status]);
  
      res.status(201).json({ message: 'Order registered successfully' });
    } catch (error) {
     
        console.error('Error registering order:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  //GET ALL
router.get('/api/allorderstatus', authenticateToken, (req, res) => {

    try {

        db.query('SELECT order_statusID, order_id, time, status FROM order_status', (err, result) =>{
            
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
router.get('/api/orderstatus/:id', authenticateToken, async (req, res) => {

    let order_statusID = req.params.id;

    if (!order_statusID) {
        return res.status(400).json({ error: true, message: 'Please provide order status ID' });
    }

    try {

        // Query to fetch customer by ID
        db.query('SELECT order_statusID, order_id, time, status FROM order_status WHERE order_statusID = ?', order_statusID, (err, result) => {

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
router.put('/api/orderstatus/:id', async (req, res) => {
    let order_statusID = req.params.id;

    const { order_id, status } = req.body;

    if (!order_id|| !status ) {
        return res.status(400).send({ error: user, message: 'Please provide customer_id, pickupDate, pickupTime and totalAmount' });
    }

    try {
        db.query('UPDATE order_status SET order_id = ?, status = ? WHERE order_statusID = ?', [order_id, status, order_statusID], (err, result, fields) => {
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
router.delete('/api/orderstatus/:id', async (req, res) => {

    let order_statusID = req.params.id;

    if (!order_statusID) {
        return res.status(400).send({ error: true, message: 'provide  pickuporder_id'});
    }

    try{
        db.query('DELETE FROM order_status WHERE order_statusID = ?', order_statusID, (err, result, fields) => {

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