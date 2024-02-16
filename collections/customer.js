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

//POST
router.post('/api/customer', async (req,res) =>{

    try {

        const {fullname, email, username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertCustomerQuery = 'INSERT INTO customers (fullname, email, username, password) VALUES (?,?,?,?)';
        await db.promise().execute(insertCustomerQuery, [fullname, email, username, hashedPassword]);

        res.status(201).json({message: "Customer registered successfully"});
    } catch (error) {
       
        console.error('Error registering customer:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

//LOGIN
router.post('/api/CSlogin', async (req,res) => {
    try{
        const {username,password} = req.body;

        const getCustomerQuery = 'SELECT * FROM customers WHERE username = ?';
        const [rows] = await db.promise().execute(getCustomerQuery, [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({error: 'Invalid username or password'});
        }

        const customer = rows[0];
        const passwordMatch = await bcrypt.compare(password, customer.password);

        if (!passwordMatch) {
            return res.status(401).json({error:'Invalid username or password'});
        }

        const token = jwt.sign({custmerId: customer.id, username: customer.username}, secretKey, {expiresIn: '1h'});
        
        res.status(200).json({token});
    } catch (error) {
        console.error('Error login', error);
        res.status(500).json({error:'Internal error '});
    }

});

//GET ALL
router.get('/api/customers', (req, res) => {

    try {

        // Query to fetch customers
        db.query('SELECT customer_id\n, fullname\n, email\n, username\n FROM customers', (err, result) =>{
            
            if(err){
                console.error('Error fetching customers:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });

    } catch (error) {
        
        console.error('Error loading customers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
});

//GET ID
router.get('/api/customer/:id', authenticateToken, async (req, res) => {

    let customerId = req.params.id;

    if (!customerId) {
        return res.status(400).json({ error: true, message: 'Please provide customer ID' });
    }

    try {

        // Query to fetch customer by ID
        db.query('SELECT customer_id, fullname, email, username FROM customers WHERE customer_id = ?', customerId, (err, result) => {

            if (err) {
                console.error('Error fetching customer:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ message: 'Customer not found' });
                } else {
                    res.status(200).json(result[0]);
                }
            }
        });

    } catch (error) {

        console.error('Error loading customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//UPDATE
router.put('/api/customer/:id', async (req, res) => {
    let customer_id = req.params.id;

    const { fullname, email, username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!customer_id|| !fullname || !email || !username || !password) {
        return res.status(400).send({ error: user, message: 'Please provide fullname, email, username, and password' });
    }

    try {
        db.query('UPDATE customers SET fullname = ?, email = ?, username = ?, password = ? WHERE customer_id = ?', [fullname, email, username, hashedPassword, customer_id], (err, result, fields) => {
            if (err) {
                console.error('Error updating item:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//DELETE
router.delete('/api/customer/:id', async (req, res) => {

    let customer_id = req.params.id;

    if (!customer_id) {
        return res.status(400).send({ error: true, message: 'provide  customer_id'});
    }

    try{
        db.query('DELETE FROM customers WHERE customer_id = ?', customer_id, (err, result, fields) => {

            if(err) {
                console.error('Error deleting items:', err);
                res.status(500).json({ message: 'Internal Server Error'});
            } else {
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading users:', error);
        res.status(500).json({ error: 'Internal Server Error'});
    }
});

module.exports = router
