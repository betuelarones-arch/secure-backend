const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { authorize: rbacAuthorize } = require('../../middlewares/rbac.middleware');
const {
  getRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} = require('./roles.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', rbacAuthorize('ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR'), getRolesController);
router.get('/:id', rbacAuthorize('ADMIN', 'GERENTE', 'EMPLEADO', 'AUDITOR'), getRoleByIdController);
router.post('/', rbacAuthorize('ADMIN'), createRoleController);
router.put('/:id', rbacAuthorize('ADMIN'), updateRoleController);
router.delete('/:id', rbacAuthorize('ADMIN'), deleteRoleController);

module.exports = router;
