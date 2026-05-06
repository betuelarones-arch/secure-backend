const { verifyToken } = require('../utils/jwt.util');
const { PrismaClient } = require('@prisma/client');
const { UnauthorizedError } = require('../utils/errors.util');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    if (user.isBlocked) {
      throw new UnauthorizedError('Usuario bloqueado');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError(error.message));
  }
};

module.exports = { authenticate };
