const express = require('express');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authorizeProduct } = require('../../middlewares/abac.middleware');
const {
  getProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
} = require('./products.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', authorizeProduct('read'), getProductsController);
router.get('/:id', authorizeProduct('read'), getProductByIdController);
router.post('/', authorizeProduct('create'), createProductController);
router.put('/:id', authorizeProduct('update'), updateProductController);
router.delete('/:id', authorizeProduct('delete'), deleteProductController);

module.exports = router;
