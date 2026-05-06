const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('./products.service');
const { createProductSchema, updateProductSchema } = require('../../utils/validators.util');

const getProductsController = async (req, res, next) => {
  try {
    const products = await getProducts(req.user);
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const getProductByIdController = async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id, req.user);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProductController = async (req, res, next) => {
  try {
    const validated = createProductSchema.parse(req.body);
    const product = await createProduct(validated, req.user);
    res.status(201).json(product);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    next(error);
  }
};

const updateProductController = async (req, res, next) => {
  try {
    const validated = updateProductSchema.parse(req.body);
    const product = await updateProduct(req.params.id, validated, req.user);
    res.json(product);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Datos inválidos', errors: error.errors });
    }
    next(error);
  }
};

const deleteProductController = async (req, res, next) => {
  try {
    await deleteProduct(req.params.id, req.user);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
};
