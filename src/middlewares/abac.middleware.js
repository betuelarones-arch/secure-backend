const { ForbiddenError } = require('../utils/errors.util');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware para validar acceso a productos basado en atributos
const authorizeProduct = (action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const userRoles = user.userRoles.map((ur) => ur.role.name);
      const productId = req.params.id;

      // Admin tiene acceso total
      if (userRoles.includes('ADMIN')) {
        return next();
      }

      // Para auditor, solo lectura
      if (userRoles.includes('AUDITOR')) {
        if (action !== 'read') {
          throw new ForbiddenError('Auditor solo tiene permisos de lectura');
        }
        return next();
      }

      // Obtener el producto si se proporciona un ID
      let product = null;
      if (productId) {
        product = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new ForbiddenError('Producto no encontrado');
        }
      }

      // GERENTE
      if (userRoles.includes('GERENTE')) {
        if (action === 'read') {
          // Solo productos de su tienda
          if (product && product.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede ver productos de su tienda');
          }
        } else if (action === 'create') {
          // Puede crear en su tienda
          if (req.body.storeId && req.body.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede crear productos en su tienda');
          }
        } else if (action === 'update') {
          // Todo menos categoría, solo de su tienda
          if (product.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede modificar productos de su tienda');
          }
          if (req.body.category !== undefined) {
            throw new ForbiddenError('No puede modificar la categoría');
          }
        } else if (action === 'delete') {
          // Solo no premium de su tienda
          if (product.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede eliminar productos de su tienda');
          }
          if (product.isPremium) {
            throw new ForbiddenError('No puede eliminar productos premium');
          }
        }
      }

      // EMPLEADO
      if (userRoles.includes('EMPLEADO')) {
        if (action === 'read') {
          // Solo productos de su tienda
          if (product && product.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede ver productos de su tienda');
          }
        } else if (action === 'create') {
          // Solo NO premium
          if (req.body.isPremium) {
            throw new ForbiddenError('No puede crear productos premium');
          }
          // Solo de su tienda
          if (req.body.storeId && req.body.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede crear productos en su tienda');
          }
        } else if (action === 'update') {
          // Solo stock, solo de su tienda
          if (product.storeId !== user.storeId) {
            throw new ForbiddenError('Solo puede modificar productos de su tienda');
          }
          const allowedFields = ['stock'];
          const updateFields = Object.keys(req.body);
          const hasInvalidFields = updateFields.some((f) => !allowedFields.includes(f));
          if (hasInvalidFields) {
            throw new ForbiddenError('Solo puede actualizar el stock');
          }
        } else if (action === 'delete') {
          throw new ForbiddenError('No tiene permisos para eliminar productos');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorizeProduct };
