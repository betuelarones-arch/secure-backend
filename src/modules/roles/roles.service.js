const { PrismaClient } = require('@prisma/client');
const { logAction } = require('../../utils/logger.util');
const { NotFoundError, ConflictError, BadRequestError } = require('../../utils/errors.util');

const prisma = new PrismaClient();

const getRoles = async () => {
  return await prisma.role.findMany({
    include: { userRoles: true },
    orderBy: { name: 'asc' },
  });
};

const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { userRoles: { include: { user: true } } },
  });

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  return role;
};

const createRole = async (name, description) => {
  const existing = await prisma.role.findUnique({ where: { name } });

  if (existing) {
    throw new ConflictError('El rol ya existe');
  }

  const role = await prisma.role.create({
    data: { name, description },
  });

  await logAction(null, 'CREATE_ROLE', 'Role', role.id, `Rol creado: ${name}`);

  return role;
};

const updateRole = async (id, data) => {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  const updated = await prisma.role.update({
    where: { id },
    data,
  });

  await logAction(null, 'UPDATE_ROLE', 'Role', id, `Rol actualizado: ${role.name}`);

  return updated;
};

const deleteRole = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { userRoles: true },
  });

  if (!role) {
    throw new NotFoundError('Rol no encontrado');
  }

  if (role.userRoles.length > 0) {
    throw new BadRequestError('No se puede eliminar un rol con usuarios asignados');
  }

  await prisma.role.delete({ where: { id } });

  await logAction(null, 'DELETE_ROLE', 'Role', id, `Rol eliminado: ${role.name}`);
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
