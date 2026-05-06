const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { logAction } = require('../../utils/logger.util');
const { NotFoundError, ConflictError, BadRequestError } = require('../../utils/errors.util');

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const getUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      userRoles: { include: { role: true } },
      store: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    storeId: u.storeId,
    store: u.store,
    roles: u.userRoles.map((ur) => ur.role),
    mfaEnabled: u.mfaEnabled,
    isBlocked: u.isBlocked,
    createdAt: u.createdAt,
  }));
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: { include: { role: true } },
      store: true,
    },
  });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    storeId: user.storeId,
    store: user.store,
    roles: user.userRoles.map((ur) => ur.role),
    mfaEnabled: user.mfaEnabled,
    isBlocked: user.isBlocked,
    createdAt: user.createdAt,
  };
};

const createUser = async (email, password, fullName, storeId, role) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    throw new ConflictError('El email ya está registrado');
  }
  
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      storeId,
    },
    include: { store: true },
  });
  
  // Asignar rol si se proporciona
  if (role) {
    const roleObj = await prisma.role.findUnique({ where: { name: role } });
    if (!roleObj) {
      throw new NotFoundError('Rol no encontrado');
    }
    await prisma.userRole.create({
      data: { userId: user.id, roleId: roleObj.id },
    });
  }
  
  await logAction(null, 'CREATE_USER', 'User', user.id, `Usuario creado: ${email}`);
  
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    storeId: user.storeId,
  };
};

const updateUser = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  const updateData = { ...data };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  if ('storeId' in updateData) {
    if (!updateData.storeId || updateData.storeId.trim() === '') {
      delete updateData.storeId;
    } else {
      const store = await prisma.store.findUnique({ where: { id: updateData.storeId } });
      if (!store) {
        throw new BadRequestError('Tienda no encontrada');
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      userRoles: { include: { role: true } },
      store: true,
    },
  });

  await logAction(null, 'UPDATE_USER', 'User', id, `Usuario actualizado: ${updatedUser.email}`);

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    storeId: updatedUser.storeId,
    roles: updatedUser.userRoles.map((ur) => ur.role),
  };
};

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  await prisma.user.delete({ where: { id } });

  await logAction(null, 'DELETE_USER', 'User', id, `Usuario eliminado: ${user.email}`);
};

const assignRole = async (userId, roleName, assignedById) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Usuario no encontrado');
  
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) throw new NotFoundError('Rol no encontrado');
  
  // Eliminar todos los roles existentes (un usuario solo tiene un rol)
  await prisma.userRole.deleteMany({
    where: { userId },
  });
  
  // Asignar el nuevo rol
  await prisma.userRole.create({
    data: { userId, roleId: role.id, assignedById },
  });
  
  await logAction(assignedById, 'ASSIGN_ROLE', 'UserRole', null, `Rol ${role.name} asignado a usuario ${userId}`);
};

const removeRole = async (userId, roleId) => {
  const userRole = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId } },
  });

  if (!userRole) {
    throw new NotFoundError('Rol no asignado a este usuario');
  }

  await prisma.userRole.delete({
    where: { userId_roleId: { userId, roleId } },
  });

  await logAction(null, 'REMOVE_ROLE', 'UserRole', null, `Rol removido de usuario ${userId}`);
};

const unblockUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new NotFoundError('Usuario no encontrado');
  }

  await prisma.user.update({
    where: { id },
    data: { isBlocked: false, failedAttempts: 0 },
  });

  await logAction(null, 'UNBLOCK_USER', 'User', id, `Usuario desbloqueado: ${user.email}`);
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  assignRole,
  removeRole,
  unblockUser,
};
