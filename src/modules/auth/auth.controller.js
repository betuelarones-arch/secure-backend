const { register, login, setupMFA, verifyMFA, toggleMFAStatus, adminSetupMFAForUser, adminToggleMFAForUser } = require('./auth.service');

const registerController = async (req, res, next) => {
  try {
    const { email, password, fullName, storeId } = req.body;
    const result = await register(email, password, fullName, storeId);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: result,
    });
  } catch (error) {
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }
    const result = await login(email, password);
    res.json({
      message: result.requiresMFA ? 'Verificación MFA requerida' : 'Login exitoso',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const setupMFAController = async (req, res, next) => {
  try {
    const result = await setupMFA(req.user.id);
    res.json({
      message: 'Configuración MFA iniciada',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyMFAController = async (req, res, next) => {
  try {
    const { token, tempToken } = req.body;
    if (!token || !tempToken) {
      return res.status(400).json({ message: 'Token y tempToken requeridos' });
    }
    const result = await verifyMFA(tempToken, token);
    res.json({
      message: 'MFA verificado exitosamente',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const toggleMFAStatusController = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const result = await toggleMFAStatus(req.user.id, enabled);
    res.json({
      message: `MFA ${result.mfaEnabled ? 'habilitado' : 'deshabilitado'} exitosamente`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const adminSetupMFAForUserController = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId es requerido' });
    }
    const result = await adminSetupMFAForUser(userId);
    res.json({
      message: `MFA habilitado para el usuario`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const adminToggleMFAForUserController = async (req, res, next) => {
  try {
    const { userId, enabled } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId es requerido' });
    }
    const result = await adminToggleMFAForUser(userId, enabled);
    res.json({
      message: `MFA ${enabled ? 'habilitado' : 'deshabilitado'} para el usuario`,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerController,
  loginController,
  setupMFAController,
  verifyMFAController,
  toggleMFAStatusController,
  adminSetupMFAForUserController,
  adminToggleMFAForUserController,
};
