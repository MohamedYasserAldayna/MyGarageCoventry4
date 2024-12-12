const express = require('express');
const cors =require('cors');
const jwt =require('jsonwebtoken');
const bcrypt =require('bcrypt');
const db_access = require('./database');
const db = db_access.db;
const cookieParser =require('cookie-parser');
const server =express();
const port = 5001;
const secret_key ='1234567800987654321qwertyuioplkjhgfdsazxcvbnm';

server.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
}));
server.use(express.json());
server.use(cookieParser());


const generateToken = (id, role) => {
    return jwt.sign({ id, role }, secret_key, { expiresIn: '1h' });
};

const verifyToken = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).send('Unauthorized');
    jwt.verify(token, secret_key, (err, userDetails) => {
        if (err) return res.status(403).send('Invalid or expired token');
        req.userDetails = userDetails;
        next();
    });
};
server.post('/user/register', (req, res) => {
    const { username, email, password, role } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).send('Error hashing password');
        db.run(`INSERT INTO USER (USERNAME, EMAIL, PASSWORD, ROLE) VALUES (?, ?, ?, ?)`,
            [username, email, hashedPassword, role],
            (err) => {
                if (err) return res.status(400).send(err.message);
                res.status(200).send('Registration successful');
            }
        );
    });
});

server.post('/user/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM USER WHERE EMAIL = ?`, [email], (err, row) => {
        if (!row) return res.status(401).send('Invalid credentials');
        bcrypt.compare(password, row.PASSWORD, (err, isMatch) => {
            if (err || !isMatch) return res.status(401).send('Invalid credentials');
            const token = generateToken(row.ID, row.ROLE);
            res.cookie('authToken', token, {
                httpOnly: true,
                sameSite: 'none',
                secure: true,
            });
            res.status(200).json({ id: row.ID, role: row.ROLE });
        });
    });
});

server.post('/parts/add', verifyToken, (req, res) => {
    if (req.userDetails.role !=='admin') return res.status(403).send('Forbidden');
    const { name, price, stock, partTypeId, sellerId } = req.body;
    db.run(`INSERT INTO PRODUCT (NAME, PRICE, STOCK, PART_TYPE_ID, SELLER_ID) VALUES (?, ?, ?, ?, ?)`,
        [name, price, stock, partTypeId, sellerId],
        (err) => {
            if (err) return res.status(400).send(err.message);
            res.status(200).send( 'Part added successfully');
        }
    );
});


server.get('/parts', (req, res) => {
    db.all(`SELECT * FROM PRODUCT`, (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});
server.post('/service-center/add', verifyToken, (req, res) => {
    if (req.userDetails.role !== 'admin') return res.status(403).send('Forbidden');
    const { name, location, contact } = req.body;
    db.run(`INSERT INTO USER (USERNAME, EMAIL, PASSWORD, ROLE, BUSINESS_NAME) VALUES (?, ?, ?, ?, ?)`,
        [name, '', '', 'service_center', contact],
        (err) => {
            if (err) return res.status(400).send(err.message);
            res.status(200).send('Service center added successfully');
        }
    );
});


server.get('/service-centers', (req, res) => {
    db.all(`SELECT * FROM USER WHERE ROLE = 'service_center'`, (err, rows) => {
        if (err) return res.status(500).send(err.message);
        res.json(rows);
    });
});


server.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
    db.serialize(() => {
        db.run(db_access.createUserTable, (err) => {
            if (err) {
                console.log('Error creating user table:', err.message);
                return;
            }
            console.log('User table created successfully');
        });
        db.run(db_access.createPartTypeTable, (err) => {
            if (err) {
                console.log('Error creating part type table:', err.message);
                return;
            }
            console.log('Part type table created successfully');
        });
        db.run(db_access.createCarBrandTable, (err) => {
            if (err) {
                console.log('Error creating car brand table:', err.message);
                return;
            }
            console.log('Car brand table created successfully');
        });
        db.run(db_access.createProductTable, (err) => {
            if (err) {
                console.log('Error creating product table:', err.message);
                return;
            }
            console.log('Product table created successfully');
        });
        db.run(db_access.createProductCarBrandTable, (err) => {
            if (err) {
                console.log('Error creating product car brand table:', err.message);
                return;
            }
            console.log('Product car brand table created successfully');
        });
        db.run(db_access.createAppointmentTable, (err) => {
            if (err) {
                console.log('Error creating appointment table:', err.message);
                return;
            }
            console.log('Appointment table created successfully');
        });
        db.run(db_access.createOrderTable, (err) => {
            if (err) {
                console.log('Error creating order table:', err.message);
                return;
            }
            console.log('Order table created successfully');
        });
        db.run(db_access.createOrderItemsTable, (err) => {
            if (err) {
                console.log('Error creating order items table:', err.message);
                return;
            }
            console.log('Order items table created successfully');
        });
    });
});

server.on('error', (err) => {
    console.error('Error starting server:', err);
});
