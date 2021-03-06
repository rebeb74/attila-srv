const User = require('../models/user');
const mongoose = require('mongoose');
const {
  check
} = require('prettier');
const {
  forEach
} = require('lodash');

const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Anything controller.
 * @module controllers/users
 */

/**
 * Example controller to get information about request.
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
module.exports.getUsers = (req, res) => {
  if (req.user.isAdmin) {
    User.find()
      .sort({
        'createdOn': -1
      })
      .exec()
      .then(users => res.status(200).json(users))
      .catch(err => res.status(500).json({
        message: 'users not found :(',
        error: err
      }));
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};

module.exports.getUser = (req, res) => {
  const id = req.user._id;
  User.findById(id)
    .then((user) => {
      return res.status(200).json(user);
    })
    .catch(err => res.status(500).json({
      message: `user with id ${id} not found`,
      error: err
    }));
};

module.exports.getUserById = (req, res) => {
  const id = req.params.id;
  if (id == req.user._id || req.user.isAdmin) {
    User.findById(id)
      .then((user) => {
        return res.status(200).json(user);
      })
      .catch(err => res.status(500).json({
        message: `user with id ${id} not found`,
        error: err
      }));
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};

module.exports.getUserIdByUsername = (req, res) => {
  const username = req.params.username;

  User.find({
      username: username
    })
    .then((user) => {
      return res.status(200).json(user[0]);
    })
    .catch(err => res.status(500).json({
      message: 'user not found',
      error: err
    }));

};

module.exports.updateUserById = async (req, res) => {
  const id = req.params.id;

  if (req.body.email == null || req.body.username == null) {
    throw new MissingRequiredParameterError({
      info: {
        body: ['email, username']
      }
    });
  }

  // Check username length
  if (req.body.username.length >= 12 || req.body.username.length <= 3) {
    return res.status(400).json({
      'error': 'wrong username (must be length 3 - 12)'
    });
  }

  // Validate email
  if (!EMAIL_REGEX.test(req.body.email)) {
    return res.status(400).json({
      'error': 'email is not valid'
    });
  }

  if (id == req.user._id || req.user.isAdmin) {
    User.find({
      username: req.body.username
    }, (err, result) => {
      if (result == '' || req.user._id.toString() === result[0]._id.toString()) {
        User.find({
          email: req.body.email
        }, (err, result) => {
          if (result == '' || req.user._id.toString() === result[0]._id.toString()) {
            User.findByIdAndUpdate(id, {
                username: req.body.username,
                email: req.body.email,
                share: req.body.share,
              },
              (err, user) => {
                if (err) {
                  return res.status(500).json({
                    message: 'User Update Failed',
                    code: 'user_update_failed'
                  });
                }
                res.status(202).json({
                  msg: 'user updated'
                });
              });
          } else {
            return res.status(409).json({
              message: 'email or user already exist',
              code: 'email_username_already_used'
            });
          }
        });
      } else {
        return res.status(409).json({
          message: 'email or user already exist',
          code: 'email_username_already_used'
        });
      }
    });
  } else {
    return res.status(403).json({
      message: 'unauthorized access',
      code: 'unauthorized_access'
    });
  }
  if (req.body.share != []) {
    req.body.share.forEach(element => {
      User.findById(element.id).exec()
        .then((userShare) => {
          if (userShare.isShared != []) {
            let isAlreadyAdded = false;
            userShare.isShared.forEach((isSharedUser => {
              if (isSharedUser.id == req.body._id) {
                isAlreadyAdded = true;
              }
            }));
            if (!isAlreadyAdded) {
              userShare.isShared.push({
                id: req.user._id,
                email: req.user.email,
                username: req.user.username
              });
              User.findByIdAndUpdate(userShare._id, userShare)
                .exec()
                .then((success) => console.log(success))
                .catch((error) => console.log(error));
              isSharedAdded = true;
            }
          } else {
            userShare.isShared.push({
              id: req.user._id,
              email: req.user.email,
              username: req.user.username
            });
            User.findByIdAndUpdate(userShare._id, userShare)
              .exec()
              .then((success) => console.log(success))
              .catch((error) => console.log(error));
            isSharedAdded = true;
          }
        })
        .catch((error) => console.log(error));
    });
  }
};

module.exports.updateUserIsSharedById = (req, res) => {
  const id = req.params.id;
  console.log('req.body', req.body);
  User.findByIdAndUpdate(id, req.body)
    .exec()
    .then((success) => {
      console.log('success', success);
      res.status(202).json({
        msg: 'user updated'
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: 'user not found'
      });
    });
};

module.exports.deleteUserById = (req, res) => {
  const id = req.params.id;
  if (req.user.isAdmin) {
    User.findByIdAndDelete(id, (err, user) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(202).json({
        msg: `${user} id ${id} deleted`
      });
    });
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};

module.exports.deleteUsersByIds = (req, res) => {
  const ids = req.query.ids;
  const allIds = ids.split(',').map(id => {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      return mongoose.Types.ObjectId((id));
    } else {
      console.log('id is not valid', id);
    }
  });
  const condition = {
    _id: {
      $in: allIds
    }
  };
  if (req.user.isAdmin) {
    User.deleteMany(condition, (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }
      res.status(202).json(result);
    });
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
};