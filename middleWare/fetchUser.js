const jwt = require('jsonwebtoken');

const fetchuser = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    // req.userId = decoded.user.id; // Change this line
    console.log('Received request for user:', req.userId); 
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;