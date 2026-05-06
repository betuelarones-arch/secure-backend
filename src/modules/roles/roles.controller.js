const { getRoles, getRoleById, createRole, updateRole, deleteRole } = require('./roles.service');
const { createRoleSchema } = require('../../utils/validators.util');

const getRolesController = async (req, res, next) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (error) {
    next(error);
  }
};

const getRoleByIdController = async (req, res, next) => {
  try {
    const role = await getRoleById(req.params.id);
    res.json(role);
  } catch (error) {
    next(error);
  }
};

const createRoleController = async (req, res, next) => {
  try {
    const validated = createRoleSchema.parse(req.body);
    const role = await createRole(validated.name, validated.description);
    res.status(201).json(role);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    next(error);
  }
};

const updateRoleController = async (req, res, next) => {
  try {
    const role = await updateRole(req.params.id, req.body);
    res.json(role);
  } catch (error) {
    next(error);
  }
};

const deleteRoleController = async (req, res, next) => {
  try {
    await deleteRole(req.params.id);
    res.json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
};
