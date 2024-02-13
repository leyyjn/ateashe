const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());
const router = express.Router();

const secretKey = 'harley-secret-key';

const db = require ('./database');
const {authenticateToken} = require('../collections/authentication');

//REGISTER
router.post('/api/employee', async (req,res) =>{

    try {

        const {fullname, email, username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertEmployeeQuery = 'INSERT INTO employee (fullname, email, username, password) VALUES (?,?,?,?)';
        await db.promise().execute(insertEmployeeQuery, [fullname, email, username, hashedPassword]);

        res.status(201).json({message: "Employee registered successfully"});
    } catch (error) {
       
        console.error('Error registering employee:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});


//login
router.post('/api/Emlogin', async (req,res) => {
    try{
        const {username,password} = req.body;

        const getEmployeeQuery = 'SELECT * FROM employee WHERE username = ?';
        const [rows] = await db.promise().execute(getEmployeeQuery, [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({error: '404'});
        }

        const employee = rows[0];
        const passwordMatch = await bcrypt.compare(password, employee.password);

        if (!passwordMatch) {
            return res.status(401).json({error:'Error'});
        }

        const token = jwt.sign({employeeId: employee.employee_id, username: employee.username}, secretKey, {expiresIn: '1h'});
        
        res.status(200).json({token});
    } catch (error) {
        console.error('404', error);
        res.status(500).json({error:'404 nga'});
    }

});


//GET ALL
router.get('/api/employees', authenticateToken, (req, res) => {

    try {

        // Query to fetch customers
        db.query('SELECT employee_id, fullname, email, username FROM employee', (err, result) =>{
            
            if(err){
                console.error('Error fetching employees:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });

    } catch (error) {
        
        console.error('Error loading employees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } 
});

//GET ID
router.get('/api/employee/:id', authenticateToken, async (req, res) => {

    let employee_id = req.params.id;

    if (!employee_id) {
        return res.status(400).json({ error: true, message: 'Please provide employee ID' });
    }

    try {

        // Query to fetch employee by ID
        db.query('SELECT employee_id, fullname, email, username FROM employee WHERE employee_id = ?', employee_id, (err, result) => {

            if (err) {
                console.error('Error fetching employee:', err);
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


router.put('/api/employee/:id', authenticateToken, async (req, res) => {

    let employee_id = req.params.id;

    const {fullname, email, username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!employee_id || !fullname || !email || !username || !password){
        return res.status(400).send({ error: user, message: 'Please provide fullname, username, and password' });
    }
    
    try{
        db.query('UPDATE employee SET fullname = ?, email = ?, username = ?, password = ? WHERE employee_id = ?', [fullname, email, username, hashedPassword, employee_id], (err, result, fields) => {
            if (err) {
                console.error('Error updating item:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });
    } catch (error) {
        console.error('Error loading employee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//delete
router.delete('/api/employee/:id', (req,res) => {

    let employee_id = req.params.id;

    if (!employee_id) {
        return res.status(400).send({ error: true, message: 'provide  employee_id'});
    }

    try{
        db.query('DELETE FROM employee WHERE employee_id = ?', employee_id, (err, result, fields) => {

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

module.exports = router;