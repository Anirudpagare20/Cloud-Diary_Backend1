
require('dotenv').config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
;

const fetchuser = (req, res, next) => {
    // Get the user from the JWT token and ID to the request object
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).send({ error: "No Token Provided" });
    } 
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(500).send({ error: "Invalid Token" });
    }
};

module.exports = fetchuser;
