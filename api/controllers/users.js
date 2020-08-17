const User = require('../models/user');
const mongoose = require('mongoose');


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

module.exports.updateUserById = (req, res) => {
  const id = req.params.id;
  if (id == req.user._id || req.user.isAdmin) {
    User.findByIdAndUpdate(id, {
        username: req.body.username,
        email: req.body.email
      },
      (err, user) => {
        if (err) {
          return res.status(500).json(err);
        }
        res.status(202).json({
          msg: `${user} id ${id} updated`
        });
      });
  } else {
    return res.status(403).json({
      message: 'unauthorized access'
    });
  }
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