const { ForbiddenError } = require('../utils/errors.util');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.userRoles) {
        throw new ForbiddenError('Usuario no autenticado');
      }

      const userRoles = req.user.userRoles.map((ur) => ur.role.name);
      const hasRole = allowedRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenError('No tiene permisos para esta acción');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorize };
