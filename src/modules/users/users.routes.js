const express = require('express');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { authorize: rbacAuthorize } = require('../../middlewares/rbac.middleware');
const {
  getUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  assignRoleController,
  removeRoleController,
  unblockUserController,
} = require('./users.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', rbacAuthorize('ADMIN', 'AUDITOR'), getUsersController);
router.get('/:id', rbacAuthorize('ADMIN', 'AUDITOR'), getUserByIdController);
router.post('/', rbacAuthorize('ADMIN'), createUserController);
router.put('/:id', rbacAuthorize('ADMIN'), updateUserController);
router.delete('/:id', rbacAuthorize('ADMIN'), deleteUserController);
router.post('/roles/assign', rbacAuthorize('ADMIN'), assignRoleController);
router.delete('/:userId/roles/:roleId', rbacAuthorize('ADMIN'), removeRoleController);
router.post('/:id/unblock', rbacAuthorize('ADMIN'), unblockUserController);

module.exports = router;
