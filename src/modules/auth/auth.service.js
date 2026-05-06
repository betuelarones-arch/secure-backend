const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateToken, generatePartialToken, verifyToken: verifyJwt } = require('../../utils/jwt.util');
const { generateEmailCode, sendEmailCode } = require('../../utils/mfa.util');
const { logAction } = require('../../utils/logger.util');
const { BadRequestError, UnauthorizedError, ConflictError } = require('../../utils/errors.util');

const prisma = new PrismaClient();
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const MAX_FAILED_ATTEMPTS = 5;
const MAX_MFA_ATTEMPTS = 3;

const register = async (email, password, fullName, storeId) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ConflictError('El email ya está registrado');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
      storeId,
    },
    include: { store: true },
  });

  await logAction(user.id, 'REGISTER', 'User', user.id, `Usuario registrado: ${email}`);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    storeId: user.storeId,
  };
};

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { userRoles: { include: { role: true } }, store: true },
  });

  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  if (user.isBlocked) {
    throw new UnauthorizedError('Usuario bloqueado. Contacte al administrador');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const failedAttempts = user.failedAttempts + 1;
    const isBlocked = failedAttempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts,
        isBlocked,
        lastAttempt: new Date(),
      },
    });

    await logAction(user.id, 'LOGIN_FAILED', 'User', user.id, `Intento fallido ${failedAttempts}/${MAX_FAILED_ATTEMPTS}`);

    if (isBlocked) {
      throw new UnauthorizedError('Usuario bloqueado por múltiples intentos fallidos');
    }

    throw new UnauthorizedError('Credenciales inválidas');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedAttempts: 0, lastAttempt: new Date() },
  });

  if (user.mfaEnabled) {
    const tempToken = generatePartialToken({ userId: user.id, mfaPending: true });

    const mfaCode = generateEmailCode();
    const mfaCodeExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaCode,
        mfaCodeExpiry,
        mfaAttempts: 0,
      },
    });

    try {
      const testEmail = 'betuel.arones@tecsup.edu.pe';
      await sendEmailCode(testEmail, mfaCode);
      await logAction(user.id, 'LOGIN_MFA_EMAIL_SENT', 'User', user.id, `Código MFA enviado a ${testEmail}`);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw new Error('Error enviando código por email');
    }

    await logAction(user.id, 'LOGIN_MFA_EMAIL_REQUIRED', 'User', user.id, 'Login requiere MFA Email');

    return {
      requiresMFA: true,
      mfaType: 'EMAIL',
      tempToken,
      message: `Código enviado a betuel.arones@tecsup.edu.pe. Válido por 5 minutos.`,
    };
  }

  const roles = user.userRoles.map((ur) => ur.role.name);
  const token = generateToken({
    userId: user.id,
    email: user.email,
    roles,
    storeId: user.storeId,
  });

  await logAction(user.id, 'LOGIN_SUCCESS', 'User', user.id, 'Login exitoso');

  return {
    requiresMFA: false,
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles,
      storeId: user.storeId,
      mfaEnabled: user.mfaEnabled,
      mfaType: user.mfaType,
    },
  };
};

const setupMFA = async (userId, mfaType = 'EMAIL') => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaType: 'EMAIL',
      mfaEnabled: false,
    },
  });

  await logAction(userId, 'MFA_SETUP_EMAIL', 'User', userId, 'Configuración MFA Email iniciada');

  return {
    type: 'EMAIL',
    message: 'MFA por email configurado. Se enviará un código en el login.',
  };
};

const verifyMFA = async (tempToken, code) => {
  try {
    const decoded = verifyJwt(tempToken);

    if (!decoded.mfaPending) {
      throw new UnauthorizedError('Token inválido para MFA');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { userRoles: { include: { role: true } }, store: true },
    });

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    if (!user.mfaCode || !user.mfaCodeExpiry || new Date() > user.mfaCodeExpiry) {
      throw new UnauthorizedError('Código MFA expirado. Inicie sesión nuevamente');
    }

    if (user.mfaAttempts >= MAX_MFA_ATTEMPTS) {
      throw new UnauthorizedError('Máximo de intentos MFA alcanzado. Inicie sesión nuevamente');
    }

    if (code !== user.mfaCode) {
      const mfaAttempts = user.mfaAttempts + 1;
      const isBlocked = mfaAttempts >= MAX_MFA_ATTEMPTS;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          mfaAttempts,
          isBlocked: isBlocked 
        },
      });
      
      await logAction(user.id, 'MFA_EMAIL_FAILED', 'User', user.id, `Código MFA inválido. Intento ${mfaAttempts}/${MAX_MFA_ATTEMPTS}`);
      
      if (isBlocked) {
        throw new UnauthorizedError(`Máximo de intentos MFA alcanzado. Usuario bloqueado. Contacte al administrador`);
      }
      
      throw new UnauthorizedError(`Código inválido. Intento ${mfaAttempts}/${MAX_MFA_ATTEMPTS}`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaCode: null, mfaCodeExpiry: null, mfaAttempts: 0, mfaEnabled: true },
    });

    await logAction(user.id, 'MFA_EMAIL_VERIFIED', 'User', user.id, 'MFA Email verificado exitosamente');

    const roles = user.userRoles.map((ur) => ur.role.name);
    const fullToken = generateToken({
      userId: user.id,
      email: user.email,
      roles,
      storeId: user.storeId,
    });

    return {
      token: fullToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles,
        storeId: user.storeId,
        mfaEnabled: true,
        mfaType: user.mfaType,
      },
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token MFA inválido o expirado');
    }
    throw new UnauthorizedError(error.message);
  }
};

const toggleMFAStatus = async (userId, enable) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  if (enable && !user.mfaType) {
    throw new BadRequestError('Debe configurar MFA primero usando /mfa/setup');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: enable },
  });

  await logAction(
    userId,
    enable ? 'MFA_ENABLED' : 'MFA_DISABLED',
    'User',
    userId,
    `MFA ${enable ? 'habilitado' : 'deshabilitado'}`
  );

  return {
    mfaEnabled: enable,
    mfaType: user.mfaType,
  };
};

const adminSetupMFAForUser = async (userId, mfaType = 'EMAIL') => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      mfaType: 'EMAIL',
      mfaEnabled: true,
    },
  });

  await logAction(userId, 'MFA_SETUP_EMAIL_BY_ADMIN', 'User', userId, `MFA Email habilitado por admin para ${user.email}`);
  
  return {
    type: 'EMAIL',
    message: `MFA por email habilitado para ${user.email}. Código se enviará a betuel.arones@tecsup.edu.pe en el login.`,
  };
};

const adminToggleMFAForUser = async (userId, enable) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    throw new UnauthorizedError('Usuario no encontrado');
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: { mfaEnabled: enable },
  });
  
  await logAction(
    userId,
    enable ? 'MFA_ENABLED_BY_ADMIN' : 'MFA_DISABLED_BY_ADMIN',
    'User',
    userId,
    `MFA ${enable ? 'habilitado' : 'deshabilitado'} por admin`
  );
  
  return {
    mfaEnabled: enable,
    mfaType: user.mfaType,
  };
};

module.exports = {
  register,
  login,
  setupMFA,
  verifyMFA,
  toggleMFAStatus,
  adminSetupMFAForUser,
  adminToggleMFAForUser,
};
