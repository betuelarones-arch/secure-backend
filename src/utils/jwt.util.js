const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_PARTIAL_EXPIRES_IN = process.env.JWT_PARTIAL_EXPIRES_IN || '5m';

const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

const generatePartialToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_PARTIAL_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

module.exports = {
  generateToken,
  generatePartialToken,
  verifyToken,
};
