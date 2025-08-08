import jwt from 'jsonwebtoken';

const sendToken = (payLoad, res) => {
  const token = jwt.sign(
    { id: payLoad._id, role: payLoad.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_COOKIE_EXPIRES_IN || '30d' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });
};

export default sendToken;
