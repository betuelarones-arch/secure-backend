const { PrismaClient } = require('@prisma/client');
const { logAction } = require('../../utils/logger.util');
const { NotFoundError, ForbiddenError } = require('../../utils/errors.util');

const prisma = new PrismaClient();

const getProducts = async (user) => {
  const userRoles = user.userRoles.map((ur) => ur.role.name);

  let where = {};

  if (userRoles.includes('ADMIN') || userRoles.includes('AUDITOR')) {
    where = {};
  } else {
    where = { storeId: user.storeId };
  }

  const products = await prisma.product.findMany({
    where,
    include: { store: true, createdBy: { select: { id: true, email: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return products;
};

const getProductById = async (id, user) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { store: true, createdBy: { select: { id: true, email: true, fullName: true } } },
  });

  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }

  const userRoles = user.userRoles.map((ur) => ur.role.name);

  if (!userRoles.includes('ADMIN') && !userRoles.includes('AUDITOR')) {
    if (product.storeId !== user.storeId) {
      throw new ForbiddenError('No tiene acceso a este producto');
    }
  }

  return product;
};

const createProduct = async (data, user) => {
  const userRoles = user.userRoles.map((ur) => ur.role.name);

  if (userRoles.includes('AUDITOR')) {
    throw new ForbiddenError('Auditor no puede crear productos');
  }

  if (userRoles.includes('EMPLEADO') && data.isPremium) {
    throw new ForbiddenError('No puede crear productos premium');
  }

  if (!userRoles.includes('ADMIN')) {
    if (data.storeId !== user.storeId) {
      throw new ForbiddenError('Solo puede crear productos en su tienda');
    }
  }

  const product = await prisma.product.create({
    data: {
      ...data,
      createdById: user.id,
    },
    include: { store: true, createdBy: { select: { id: true, email: true, fullName: true } } },
  });

  await logAction(user.id, 'CREATE_PRODUCT', 'Product', product.id, `Producto creado: ${product.name}`);

  return product;
};

const updateProduct = async (id, data, user) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }

  const userRoles = user.userRoles.map((ur) => ur.role.name);

  if (userRoles.includes('AUDITOR')) {
    throw new ForbiddenError('Auditor no puede modificar productos');
  }

  if (!userRoles.includes('ADMIN')) {
    if (product.storeId !== user.storeId) {
      throw new ForbiddenError('Solo puede modificar productos de su tienda');
    }
  }

  if (userRoles.includes('GERENTE') && data.category !== undefined) {
    throw new ForbiddenError('No puede modificar la categoría');
  }

  if (userRoles.includes('EMPLEADO')) {
    const allowedFields = ['stock'];
    const updateFields = Object.keys(data);
    const hasInvalidFields = updateFields.some((f) => !allowedFields.includes(f));
    if (hasInvalidFields) {
      throw new ForbiddenError('Solo puede actualizar el stock');
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: { store: true, createdBy: { select: { id: true, email: true, fullName: true } } },
  });

  await logAction(user.id, 'UPDATE_PRODUCT', 'Product', id, `Producto actualizado: ${product.name}`);

  return updated;
};

const deleteProduct = async (id, user) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new NotFoundError('Producto no encontrado');
  }

  const userRoles = user.userRoles.map((ur) => ur.role.name);

  if (userRoles.includes('EMPLEADO') || userRoles.includes('AUDITOR')) {
    throw new ForbiddenError('No tiene permisos para eliminar productos');
  }

  if (!userRoles.includes('ADMIN')) {
    if (product.storeId !== user.storeId) {
      throw new ForbiddenError('Solo puede eliminar productos de su tienda');
    }

    if (product.isPremium) {
      throw new ForbiddenError('No puede eliminar productos premium');
    }
  }

  await prisma.product.delete({ where: { id } });

  await logAction(user.id, 'DELETE_PRODUCT', 'Product', id, `Producto eliminado: ${product.name}`);
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
