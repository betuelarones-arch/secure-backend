const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorize: rbacAuthorize } = require('../../middlewares/rbac.middleware');
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
} = require('./stores.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', rbacAuthorize('ADMIN', 'AUDITOR', 'GERENTE'), getStores);
router.get('/:id', rbacAuthorize('ADMIN', 'AUDITOR', 'GERENTE'), getStoreById);
router.post('/', rbacAuthorize('ADMIN'), createStore);
router.put('/:id', rbacAuthorize('ADMIN'), updateStore);
router.delete('/:id', rbacAuthorize('ADMIN'), deleteStore);

module.exports = router;
