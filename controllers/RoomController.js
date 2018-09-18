const db = require('../models')

module.exports = {
  get: params => {
    if (params.constructor === Array) {
      params = {'_id': {$in: params}}
    }
    return new Promise((resolve, reject) => {
      db.Room
      .find(params)
      .sort('-createdAt')
      .populate({path: 'members.user', select: 'username'})
      .then(rooms => {
        rooms = rooms.map(room => room.summary())
        resolve(rooms)})
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .populate({path: 'creator', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .populate({path: 'members.user', select: 'username'})
      .populate({path: 'notifications.user', select: 'username'})
      .populate({path: 'currentUsers', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .populate({path: 'events', select: '-room'})
      .then(room => {
        console.log("POPULATED ROOM: ", room)
        resolve(room)
      })
      .catch(err => reject(err))
    });
  },
  post: body => {
    return new Promise((resolve, reject) => {
        db.Room.create(body)
        .then(room => {
          if (body.course) {
            room.populate({path: 'course', select: 'name'})
          }
          room.populate({path: 'members.user', select: 'username'}, () => {
            resolve(room)
          })
        })
        .catch(err => {
          console.log(err); reject(err)})
      // }
    })
  },

// @TODO WE SHOULD PROBABLY JUST CREATE DIFFERENT METHODS FOR EACH OF THESE CASES?
  put: (id, body) => {
    return new Promise((resolve, reject) => {
      const updatedField = Object.keys(body)
      const { entryCode, userId } = body.checkAccess;
      if (updatedField[0] === 'checkAccess') {
        db.Room.findById(id)
        .then(room => {
          // @TODO SHOULD PROBABLY HASH THIS
          if (room.entryCode === entryCode) {
            room.members.push({user: userId, role: 'student'})
            room.save()
            room.populate({path: 'members.user', select: 'username'}, function() {
              resolve(room)
            })
          } else reject('incorrect entry code')
        })
        .catch(err => reject(err))
      } else {
        db.Room.findByIdAndUpdate(id, body, {new: true})
        .then(room => { console.log(room); resolve(body)})
        .catch(err => {console.log(err); reject(err)})
      }
    })
  },

  // addMember
  // remove member

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .then(room => {
        room.remove()
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },

  // SOCKET METHODS
  addCurrentUsers: (roomId, userId) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentUsers: userId}}, {new: true})
      .populate({path: 'currentUsers', select: 'username'})
      .select('currentUsers events chat')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentUsers: userId}}, {new: true})
      .populate({path: 'currentUsers', select: 'username'})
      .select('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },


}
