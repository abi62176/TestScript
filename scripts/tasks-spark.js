// Description:

var _ = require('lodash');

String.prototype.trim = function () {
  var trimmed = this.replace(/^\s+|\s+$/g, '');
  return trimmed;
};
String.prototype.ltrim = function () {
  var trimmed = this.replace(/^\s+/g, '');
  return trimmed;
};
String.prototype.rtrim = function () {
  var trimmed = this.replace(/\s+$/g, '');
  return trimmed;
};

var tasksSpark = function tasksSpark(robot) {

  robot.brain.on('loaded', function () {
    if (!robot.brain.data.user_tasks) {
      robot.brain.data.user_tasks = [];
    }
  });

  robot.respond(/hello/i, function (res) {
    res.send('hello');
  });

  robot.respond(/(?:assign|add) task:['"]([\w\.,:_ -]+)['"] to ([\w\._]+@[\w\._-]+.[\w]+)/i,
    function (res) {
      var email = res.match[2].trim().toLowerCase();
      var newTask = res.match[1].ltrim().rtrim();

      var user_tasks = robot.brain.data.user_tasks || [];

      var user = _.find(user_tasks, _.matchesProperty('email', email));
      if (user) {
        if (_.find(user.tasks, function (t) {
          return t.toLowerCase() === newTask.toLowerCase();
        })) {
          return res.send('task:"' + newTask + '" is already assigned to ' + email);
        } else {
          user.tasks.push(newTask);
        }
      } else {
        user = {
          email: email,
          tasks: []
        };
        user.tasks.push(newTask);
        user_tasks.push(user);
      }

      res.send('task:"' + newTask + '" is added to ' + email);
    }
  );

  robot.respond(/(?:list|show) tasks of ([\w\._]+@[\w\._-]+.[\w]+)/i, function (res) {
    var email = res.match[1];
    var user_tasks = robot.brain.data.user_tasks || [];
    var user = _.find(user_tasks, _.matchesProperty('email', email));

    if (user) {
      if (user.tasks.length > 0) {
        return res.send('Tasks assigned to ' + email + ': ' + user.tasks.join(', '));
      } else {
        return res.send('No tasks assigned to ' + email);
      }
    } else {
      return res.send('No user found with email - ' + email);
    }

  });

  robot.respond(/(?:withdraw|revoke) task:['"]([\w\.,:_ -]+)['"] of ([\w\._]+@[\w\._-]+.[\w]+)/i,
    function (res) {

      var email = res.match[2];
      var task = res.match[1];

      var user_tasks = robot.brain.data.user_tasks || [];

      var user = _.find(user_tasks, _.matchesProperty('email', email));
      if (user) {
        if (_.includes(user.tasks, task)) {
          _.pull(user.tasks, task);
          return res.send('task:"' + task + '" withdrawn');
        } else {
          return res.send('task:"' + task + '" is not assigned to ' + email);
        }
      } else {
        res.send('No user found with email - ' + email);
      }
    }
  );

};

exports = module.exports = tasksSpark;