const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'sql6.freemysqlhosting.net',
    user: 'sql6683565',
    password: 'txJTKGbXHJ',
    database: 'sql6683565',
});

db.getConnection((err) => {

    if (err) {
        console.error('Error connectinng to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

module.exports = db
