import mysql2 from 'mysql2/promise'

const pool = mysql2.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usermmanager',
    queueLimit: 10,
    waitForConnection: true
})

export default pool;