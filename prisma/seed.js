const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear tiendas
  const store1 = await prisma.store.upsert({
    where: { name: 'Tienda Central' },
    update: {},
    create: { name: 'Tienda Central', address: 'Av. Principal 123' },
  });

  const store2 = await prisma.store.upsert({
    where: { name: 'Tienda Norte' },
    update: {},
    create: { name: 'Tienda Norte', address: 'Calle Norte 456' },
  });

  console.log('✅ Tiendas creadas');

  // Crear roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Administrador con acceso total' },
  });

  const gerenteRole = await prisma.role.upsert({
    where: { name: 'GERENTE' },
    update: {},
    create: { name: 'GERENTE', description: 'Gerente de tienda' },
  });

  const empleadoRole = await prisma.role.upsert({
    where: { name: 'EMPLEADO' },
    update: {},
    create: { name: 'EMPLEADO', description: 'Empleado de tienda' },
  });

  const auditorRole = await prisma.role.upsert({
    where: { name: 'AUDITOR' },
    update: {},
    create: { name: 'AUDITOR', description: 'Auditor con solo lectura' },
  });

  console.log('✅ Roles creados');

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@secure.com' },
    update: {},
    create: {
      email: 'admin@secure.com',
      password: adminPassword,
      fullName: 'Administrador Principal',
      storeId: store1.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log('✅ Usuario admin creado (admin@secure.com / Admin123!)');

  // Crear usuario gerente
  const gerentePassword = await bcrypt.hash('Gerente123!', 10);
  const gerente = await prisma.user.upsert({
    where: { email: 'gerente@secure.com' },
    update: {},
    create: {
      email: 'gerente@secure.com',
      password: gerentePassword,
      fullName: 'Gerente Tienda Central',
      storeId: store1.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: gerente.id, roleId: gerenteRole.id } },
    update: {},
    create: { userId: gerente.id, roleId: gerenteRole.id },
  });

  console.log('✅ Usuario gerente creado (gerente@secure.com / Gerente123!)');

  // Crear usuario empleado
  const empleadoPassword = await bcrypt.hash('Empleado123!', 10);
  const empleado = await prisma.user.upsert({
    where: { email: 'empleado@secure.com' },
    update: {},
    create: {
      email: 'empleado@secure.com',
      password: empleadoPassword,
      fullName: 'Empleado Tienda Central',
      storeId: store1.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: empleado.id, roleId: empleadoRole.id } },
    update: {},
    create: { userId: empleado.id, roleId: empleadoRole.id },
  });

  console.log('✅ Usuario empleado creado (empleado@secure.com / Empleado123!)');

  // Crear usuario auditor
  const auditorPassword = await bcrypt.hash('Auditor123!', 10);
  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@secure.com' },
    update: {},
    create: {
      email: 'auditor@secure.com',
      password: auditorPassword,
      fullName: 'Auditor del Sistema',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: auditor.id, roleId: auditorRole.id } },
    update: {},
    create: { userId: auditor.id, roleId: auditorRole.id },
  });

  console.log('✅ Usuario auditor creado (auditor@secure.com / Auditor123!)');

  // Crear algunos productos de ejemplo
  await prisma.product.createMany({
    data: [
      {
        name: 'Laptop Premium',
        description: 'Laptop de alta gama',
        price: 1500.00,
        stock: 10,
        category: 'Electrónicos',
        storeId: store1.id,
        isPremium: true,
        createdById: admin.id,
      },
      {
        name: 'Mouse Inalámbrico',
        description: 'Mouse ergonómico',
        price: 25.50,
        stock: 50,
        category: 'Accesorios',
        storeId: store1.id,
        isPremium: false,
        createdById: gerente.id,
      },
      {
        name: 'Teclado Mecánico',
        description: 'Teclado gaming RGB',
        price: 120.00,
        stock: 30,
        category: 'Accesorios',
        storeId: store2.id,
        isPremium: false,
        createdById: admin.id,
      },
    ],
  });

  console.log('✅ Productos de ejemplo creados');
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
