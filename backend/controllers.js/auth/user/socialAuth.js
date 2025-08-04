import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import userModel from '../../../models/userModel.js';
import jwt from 'jsonwebtoken';

const authCallback = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication failed try again', 401));
  }
  const user = req.user;
  console.log('User from social auth:', user);

  if (user.password) user.password = undefined;

  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

export default {
  authCallback,
};

/**
 * 
 * Microsoft profile: {
  provider: 'microsoft',
  name: { familyName: 'Safwat', givenName: 'Mostafa' },
  id: '45e7d855e25be9ea',
  displayName: 'Mostafa Safwat',
  userPrincipalName: 'mostafa.12safwat@outlook.com',
  emails: [ { type: 'work', value: 'mostafa.12safwat@outlook.com' } ],
  _raw: '{"@odata.context":"https://graph.microsoft.com/v1.0/$metadata#users/$entity","userPrincipalName":"mostafa.12safwat@outlook.com","id":"45e7d855e25be9ea","displayName":"Mostafa Safwat","surname":"Safwat","givenName":"Mostafa","preferredLanguage":"en-US","mail":"mostafa.12safwat@outlook.com","mobilePhone":null,"jobTitle":null,"officeLocation":null,"businessPhones":[]}',
  _json: {
    '@odata.context': 'https://graph.microsoft.com/v1.0/$metadata#users/$entity',
    userPrincipalName: 'mostafa.12safwat@outlook.com',
    id: '45e7d855e25be9ea',
    displayName: 'Mostafa Safwat',
    surname: 'Safwat',
    givenName: 'Mostafa',
    preferredLanguage: 'en-US',
    mail: 'mostafa.12safwat@outlook.com',
    mobilePhone: null,
    jobTitle: null,
    officeLocation: null,
    businessPhones: []
  }
}
GET /api/v1/users/auth/social/microsoft/callback?code=M.C530_BAY.2.U.e08b57d6-bd47-fe91-a929-40d96d919929 - - ms - -

 */
