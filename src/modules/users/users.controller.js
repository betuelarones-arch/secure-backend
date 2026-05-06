const { getUsers, getUserById, createUser, updateUser, deleteUser, assignRole, removeRole, unblockUser } = require('./users.service');
const { createUserSchema, assignRoleSchema } = require('../../utils/validators.util');

const getUsersController = async (req, res, next) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserByIdController = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUserController = async (req, res, next) => {
  try {
    const validated = createUserSchema.parse(req.body);
    const user = await createUser(validated.email, validated.password, validated.fullName, validated.storeId, validated.role);
    res.status(201).json(user);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    next(error);
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    await deleteUser(req.params.id);
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

const assignRoleController = async (req, res, next) => {
  try {
    const validated = assignRoleSchema.parse(req.body);
    const result = await assignRole(validated.userId, validated.role, req.user.id);
    res.json(result);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    next(error);
  }
};

const removeRoleController = async (req, res, next) => {
  try {
    await removeRole(req.params.userId, req.params.roleId);
    res.json({ message: 'Rol removido exitosamente' });
  } catch (error) {
    next(error);
  }
};

const unblockUserController = async (req, res, next) => {
  try {
    await unblockUser(req.params.id);
    res.json({ message: 'Usuario desbloqueado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  assignRoleController,
  removeRoleController,
  unblockUserController,
};
