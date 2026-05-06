const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

const generateSecret = (email) => {
  const secret = speakeasy.generateSecret({
    name: `SecureApp:${email}`,
    length: 20,
  });

  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
};

const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Error generando código QR');
  }
};

const verifyToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1,
  });
};

const generateEmailCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmailCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Código de verificación MFA - SecureApp',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Código de Verificación MFA</h2>
        <p>Tu código de verificación es:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666;">Este código expirará en 5 minutos.</p>
        <p style="color: #999; font-size: 12px;">Si no solicitaste este código, ignora este correo.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw new Error('Error enviando código por email');
  }
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateEmailCode,
  sendEmailCode,
};
