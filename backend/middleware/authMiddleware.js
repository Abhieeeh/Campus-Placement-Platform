import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (token) {
            const secret = process.env.JWT_SECRET;
            jwt.verify(token, secret, (err, decoded) => {
                if (!err && decoded) {
                    req.user = decoded; // { userId, role }
                }
            });
        }
        next();
    } catch (error) {
        next();
    }
};

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required. Token missing.' });
    }

    const secret = process.env.JWT_SECRET;
    jwt.verify(token, secret, (err, decoded) => {
        if (err || !decoded) {
            return res.status(403).json({ message: 'Invalid or expired authentication token.' });
        }
        req.user = decoded;
        next();
    });
};
