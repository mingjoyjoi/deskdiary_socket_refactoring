const { v4: uuidv4 } = require('uuid');

module.exports = {
  generateUUID: (context, events, done) => {
    context.vars.uuid = uuidv4();
    return done();
  },
};
