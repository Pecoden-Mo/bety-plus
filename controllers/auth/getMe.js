import jwt from 'jsonwebtoken';
import User from '../../models/userModel.js';

const getMe = async (req, res) => {
  try {
    const { token } = req.cookies;
    console.log({ ...req.cookies });

    if (!token) {
      return res.status(200).json({
        status: 'success',
        user: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      '-password -__v -resetPasswordToken -resetPasswordExpire -createdAt -updatedAt -lastResetRequest -resetPasswordAttempts -resetPasswordExpires -passwordChangedAt'
    );

    if (!user) {
      return res.status(200).json({
        status: 'success',
        user: null,
      });
    }

    res.status(200).json({
      status: 'success',
      user: user,
    });
  } catch (error) {
    res.status(200).json({
      status: 'success',
      user: null,
    });
  }
};

export default getMe;
