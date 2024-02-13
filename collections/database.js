const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ateashe',
});

db.connect((err) => {

    if (err) {
        console.error('Error connectinng to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = db