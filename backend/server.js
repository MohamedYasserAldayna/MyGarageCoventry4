const express = require('express');
const cors =require('cors');
const jwt =require('jsonwebtoken');
const bcrypt =require('bcrypt');
const db_access = require('./database');
const db = db_access.db;
const cookieParser =require('cookie-parser');
const server =express();
const port = 5003;
const secret_key ='1234567800987654321qwertyuioplkjhgfdsazxcvbnm';

server.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
}));
server.use(express.json());
server.use(cookieParser());


const generateToken = (id, role) => {
    return jwt.sign({ id, role }, secret_key, { expiresIn: '24h' });
};

const verifyToken = (req, res, next) => {
    console.log(req.cookies);
    const token = req.cookies.authToken;
    if (!token) return res.status(401).send('Unauthorized');
    jwt.verify(token, secret_key, (err, userDetails) => {
        if (err) return res.status(403).send('Invalid or expired token');
        req.userDetails = userDetails;
        next();
    });
};
server.post('/user/register', (req, res) => {
    const { username, email, password, role, businessName } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).send('All fields (username, email, password, role) are required');
    }

    const validRoles = ['admin', 'customer', 'service_center', 'part_seller'];
    if (!validRoles.includes(role)) {
        return res.status(400).send('Invalid role');
    }

    db.get('SELECT * FROM USER WHERE EMAIL = ? OR USERNAME = ?', [email, username], (err, row) => {
        if (err) return res.status(500).send('Internal server error');
        if (row) return res.status(400).send('Email or Username already in use');

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Bcrypt hashing error:', err);
                return res.status(500).send('Error hashing password');
            }

            const insertQuery = `INSERT INTO USER (USERNAME, EMAIL, PASSWORD, ROLE, BUSINESS_NAME) VALUES (?, ?, ?, ?, ?)`;

            db.run(insertQuery, [username, email, hashedPassword, role, businessName || null], function (err) {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(400).send('Error inserting user: ' + err.message);
                }
                res.status(201).send('User registered successfully');
            });
        });
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
                secure: false,
            });
            res.status(200).json({ id: row.ID, role: row.ROLE });
        });
    });
});

    server.post('/parts/add', verifyToken, (req, res) => {
        if (req.userDetails.role !=='admin') return res.status(403).send('Forbidden');
        const { name, description, price, stock, imageUrl, partTypeId, sellerId, carBrandId } = req.body;
        db.run(`INSERT INTO PRODUCT (NAME, DESCRIPTION, PRICE, STOCK, IMAGE_URL, PART_TYPE_ID, SELLER_ID, CAR_BRAND_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, description, price, stock, imageUrl, partTypeId, sellerId, carBrandId],
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


server.post('/cart/add', verifyToken, (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.userDetails.id;

    if (!productId || !quantity || quantity < 1) {
        return res.status(400).send('Product ID and valid quantity are required');
    }
    console.log("productid=" + productId);
    console.log("USER_ID=" + userId);
    db.run(
        `INSERT INTO CART (USER_ID, PRODUCT_ID, QUANTITY)
         VALUES (?, ?, ?)
         ON CONFLICT(USER_ID, PRODUCT_ID) DO UPDATE SET QUANTITY = QUANTITY + ?`,
        [userId, productId, quantity, quantity],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.status(200).send('Item added to cart successfully');
        }
    );
});


server.get('/cart', verifyToken, (req, res) => {
    const userId = req.userDetails.id;

    db.all(
        `SELECT C.ID AS cartId, P.ID AS productId, P.NAME AS productName, P.PRICE, C.QUANTITY
         FROM CART C
         JOIN PRODUCT P ON C.PRODUCT_ID = P.ID
         WHERE C.USER_ID = ?`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).send(err.message);
            res.status(200).json(rows);
        }
    );
});



server.put('/cart/update', verifyToken, (req, res) => {
    const { cartId, quantity } = req.body;

    if (!cartId || !quantity || quantity < 1) {
        return res.status(400).send('Cart ID and valid quantity are required');
    }

    db.run(
        `UPDATE CART SET QUANTITY = ? WHERE ID = ?`,
        [quantity, cartId],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.status(200).send('Cart item updated successfully');
        }
    );
});



server.delete('/cart/remove', verifyToken, (req, res) => {
    const { cartId } = req.body;

    if (!cartId) {
        return res.status(400).send('Cart ID is required');
    }

    db.run(`DELETE FROM CART WHERE ID = ?`, [cartId], (err) => {
        if (err) return res.status(500).send(err.message);
        res.status(200).send('Item removed from cart successfully');
    });
});

server.post('/cart/checkout', verifyToken, (req, res) => {
    const userId = req.userDetails.id;

    db.serialize(() => {
        db.get(
            `SELECT SUM(P.PRICE * C.QUANTITY) AS totalPrice
             FROM CART C
             JOIN PRODUCT P ON C.PRODUCT_ID = P.ID
             WHERE C.USER_ID = ?`,
            [userId],
            (err, row) => {
                if (err) return res.status(500).send(err.message);

                const totalPrice = row.totalPrice || 0;

                if (totalPrice === 0) {
                    return res.status(400).send('Cart is empty');
                }

                db.run(
                    `INSERT INTO "ORDER" (USER_ID, TOTAL_PRICE) VALUES (?, ?)`,
                    [userId, totalPrice],
                    function (err) {
                        if (err) return res.status(500).send(err.message);

                        const orderId = this.lastID;

                        db.run(
                            `INSERT INTO ORDER_ITEM (ORDER_ID, PRODUCT_ID, QUANTITY, PRICE)
                             SELECT ?, PRODUCT_ID, QUANTITY, P.PRICE
                             FROM CART C
                             JOIN PRODUCT P ON C.PRODUCT_ID = P.ID
                             WHERE C.USER_ID = ?`,
                            [orderId, userId],
                            (err) => {
                                if (err) return res.status(500).send(err.message);

                                db.run(
                                    `DELETE FROM CART WHERE USER_ID = ?`,
                                    [userId],
                                    (err) => {
                                        if (err) return res.status(500).send(err.message);
                                        res.status(200).send('Order placed successfully');
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
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
        db.run(db_access.createCartTable, (err) => {
            if (err) {
                console.log('Error creating cart table:', err.message);
                return;
            }
            console.log('Cart table created successfully');
        });
    });
});

server.on('error', (err) => {
    console.error('Error starting server:', err);
});
