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
router.post('/api/menu', async (req, res) => {
    try {
      const { menu_name, descriptions, price } = req.body;
  
      const existingMenu = await db.promise().execute('SELECT * FROM menu WHERE menu_name = ?', [menu_name]);
  
      if (existingMenu[0].length > 0) {
        return res.status(400).json({ error: 'Menu name already taken' });
      }

      const insertMenuQuery = 'INSERT INTO menu (menu_name, descriptions, price) VALUES (?, ?, ?)';
      await db.promise().execute(insertMenuQuery, [menu_name, descriptions, price]);
  
      res.status(201).json({ message: 'Menu registered successfully' });
    } catch (error) {
     
        console.error('Error registering menu:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


//GET ALL
router.get('/api/menu', authenticateToken, (req, res) => {

    try {

        // Query to fetch customers
        db.query('SELECT menu_id, menu_name, descriptions, price FROM menu', (err, result) =>{
            
            if(err){
                console.error('Error fetching menu:', err);
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
router.get('/api/menu/:id', authenticateToken, async (req, res) => {

    let menu_id = req.params.id;

    if (!menu_id) {
        return res.status(400).json({ error: true, message: 'Please provide menu ID' });
    }

    try {

        // Query to fetch customer by ID
        db.query('SELECT menu_id, menu_name, descriptions, price FROM menu WHERE menu_id = ?', menu_id, (err, result) => {

            if (err) {
                console.error('Error fetching menu:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ message: 'menu not found' });
                } else {
                    res.status(200).json(result[0]);
                }
            }
        });

    } catch (error) {

        console.error('Error loading menu:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//UPDATE
router.put('/api/menu/:id', async (req, res) => {
    let menu_id = req.params.id;

    const { menu_name, descriptions, price} = req.body;

    if (! menu_id|| ! menu_name || !descriptions || !price) {
        return res.status(400).send({ error: user, message: 'Please provide  menu_name, descriptions, and price' });
    }

    try {
        db.query('UPDATE  menu SET  menu_name = ?, descriptions = ?, price = ? WHERE  menu_id = ?', [ menu_name, descriptions, price,  menu_id], (err, result, fields) => {
            if (err) {
                console.error('Error updating item:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading  menu:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//DELETE
router.delete('/api/menu/:id', async (req, res) => {

    let menu_id = req.params.id;

    if (!menu_id) {
        return res.status(400).send({ error: true, message: 'provide  customer_id'});
    }

    try{
        db.query('DELETE FROM menu WHERE menu_id = ?', menu_id, (err, result, fields) => {

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