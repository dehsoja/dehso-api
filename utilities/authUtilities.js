const jwt = require('jsonwebtoken');


const SECRET_KEY = process.env.SECRET_KEY;

// Middleware to verify Bearer Token
const verifyToken = (req, res, next) => {
    // Get the Authorization header
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header is present and starts with 'Bearer'
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]; // Extract the token from the 'Bearer token'

        // Verify the token
        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token' });
            }
            req.user = user; // Store the decoded user info (from the token) in the request
            // console.log(user);
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }
};

module.exports = {
    verifyToken,
};