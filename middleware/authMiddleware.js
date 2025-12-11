const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin };
