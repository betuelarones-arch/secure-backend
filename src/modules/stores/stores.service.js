const { PrismaClient } = require('@prisma/client');
const { NotFoundError } = require('../../utils/errors.util');

const prisma = new PrismaClient();

const getStores = async () => {
  const stores = await prisma.store.findMany({
    orderBy: { name: 'asc' }
  });
  return stores;
};

const getStoreById = async (id) => {
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) {
    throw new NotFoundError('Tienda no encontrada');
  }
  return store;
};

const createStore = async (name, address) => {
  const store = await prisma.store.create({
    data: { name, address }
  });
  return store;
};

const updateStore = async (id, data) => {
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) {
    throw new NotFoundError('Tienda no encontrada');
  }
  const updated = await prisma.store.update({
    where: { id },
    data
  });
  return updated;
};

const deleteStore = async (id) => {
  const store = await prisma.store.findUnique({ where: { id } });
  if (!store) {
    throw new NotFoundError('Tienda no encontrada');
  }
  await prisma.store.delete({ where: { id } });
};

module.exports = {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};
