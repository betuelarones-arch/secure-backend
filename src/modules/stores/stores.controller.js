const storesService = require('./stores.service');
const { authorize } = require('../../middlewares/auth.middleware');
const { authorize: rbacAuthorize } = require('../../middlewares/rbac.middleware');

const getStores = async (req, res, next) => {
  try {
    const stores = await storesService.getStores();
    res.json(stores);
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const store = await storesService.getStoreById(req.params.id);
    res.json(store);
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    const store = await storesService.createStore(name, address);
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    const store = await storesService.updateStore(req.params.id, req.body);
    res.json(store);
  } catch (error) {
    next(error);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    await storesService.deleteStore(req.params.id);
    res.json({ message: 'Tienda eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};
