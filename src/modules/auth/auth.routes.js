const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize: rbacAuthorize } = require('../../middlewares/rbac.middleware');
const {
  registerController,
  loginController,
  setupMFAController,
  verifyMFAController,
  toggleMFAStatusController,
  adminSetupMFAForUserController,
  adminToggleMFAForUserController,
} = require('./auth.controller');

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/mfa/verify', verifyMFAController);
router.post('/mfa/setup', authenticate, setupMFAController);
router.post('/mfa/toggle', authenticate, toggleMFAStatusController);
router.post('/admin/mfa/setup', authenticate, rbacAuthorize('ADMIN'), adminSetupMFAForUserController);
router.post('/admin/mfa/toggle', authenticate, rbacAuthorize('ADMIN'), adminToggleMFAForUserController);

module.exports = router;
