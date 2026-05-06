const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logAction = async (userId, action, resource, resourceId = null, details = null, req = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: req?.ip || null,
        userAgent: req?.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Error al registrar log:', error);
  }
};

module.exports = { logAction };
