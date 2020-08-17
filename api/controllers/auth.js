const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  BadCredentialsError,
  InvalidTokenError,
  ExpiredTokenError,
  MissingRequiredParameterError
} = require('../errors');
const {
  token: config
} = require('../config');
const RefreshToken = require('../models/refreshToken');
const User = require('../models/user');
const bcrypt = require('bcrypt');


async function generateToken(user) {
  const xsrfToken = crypto.randomBytes(64).toString('hex');
  const accessToken = await jwt.sign({
      username: user.username,
      email: user.email
    },
    config.accessToken.secret, {
      expiresIn: config.accessToken.expiresIn / 1000,
      subject: user.id.toString()
    }
  );

  const refreshToken = crypto.randomBytes(128).toString('base64');
  const newRefreshToken = await new RefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + config.refreshToken.expiresIn)
  });
  newRefreshToken.save();


  return {
    accessToken,
    refreshToken
  };
}

/**
 * Auth controller.
 * @module controllers/auth
 */

/**
 * Login controller.
 * @function login
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
module.exports.login = async (req, res, next) => {
  try {
    const {
      username,
      password
    } = req.body;
    if (!username) {
      throw new MissingRequiredParameterError({
        info: {
          body: ['usename']
        }
      });
    }

    if (!password) {
      throw new MissingRequiredParameterError({
        info: {
          body: ['password']
        }
      });
    }
    const user = await User.find({
      username: username
    }).exec();
    
    if(user != ''){
      await bcrypt.compare(password, user[0].password, (errBcrypt, resBcrypt) => {
        if (!resBcrypt) {
          throw new BadCredentialsError({
            message: 'Username or password is incorrect'
          });
        }
      });
    }else{
      throw new BadCredentialsError({
        message: 'Username or password is incorrect'
      });
    }

    // Generate token
    const {
      accessToken,
      refreshToken
    } = await generateToken(user[0]);

    res.json({
      accessToken,
      accessTokenExpiresIn: config.accessToken.expiresIn,
      refreshToken,
      refreshTokenExpiresIn: config.refreshToken.expiresIn
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh token controller.
 * @function refreshToken
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
module.exports.refreshToken = async (req, res, next) => {
  try {
    const {
      token
    } = req.body;
    console.log('refresh token : ', token);
    if (!token) {
      throw new MissingRequiredParameterError({
        info: {
          body: ['token']
        }
      });
    }
    const oldRefreshToken = await RefreshToken.find({
      token: token
    }).exec();
    if (oldRefreshToken == '') {
      throw new InvalidTokenError();
    }

    if (oldRefreshToken.expiresAt < new Date()) {
      throw new ExpiredTokenError({
        info: {
          expiresAt: oldRefreshToken.expiresAt
        }
      });
    }
    const user = await User.findById(oldRefreshToken[0].userId).exec()

    const {
      accessToken,
      refreshToken: newRefreshToken
    } = await generateToken(
      user
    );

    await RefreshToken.deleteOne({ _id: oldRefreshToken[0]._id });
  
    res.json({
      accessToken,
      accessTokenExpiresIn: config.accessToken.expiresIn,
      refreshToken: newRefreshToken,
      refreshTokenExpiresIn: config.refreshToken.expiresIn
    });
  } catch (err) {
    next(err);
  }
};

module.exports.logout = async (req, res, next) => {

  res.status(200).json({ msg: 'logged out'});
};