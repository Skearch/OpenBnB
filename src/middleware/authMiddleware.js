const jwt = require('jsonwebtoken');

const authMiddleware = (role) => (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (role && decoded.role !== role) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    } catch (err) {
        req.user = null;
        next();
    }
};

module.exports = authMiddleware;