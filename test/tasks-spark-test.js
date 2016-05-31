var chai = require('chai');
var dirtyChai = require('dirty-chai');
var expect = chai.expect;

var Helper = require('hubot-test-helper');
var tasksSparkHelper = new Helper('../scripts/tasks-spark.js');

chai.use(dirtyChai);

describe('hello:', function () {
  context('abi says hello', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
    });
    afterEach(function () {
      room.destroy();
    });

    it('hubot responds hello', function () {

      var actual = [
        ['abi', '@hubot hello'],
        ['hubot', 'hello']
      ];

      return room.user.say('abi', '@hubot hello').then(function () {
        expect(room.messages).to.be.eql(actual);
      });

    });
  });
});

describe('user tasks in hubot brain', function () {
  var room = null;
  beforeEach(function () {
    room = tasksSparkHelper.createRoom();
  });
  afterEach(function () {
    room.destroy();
  });

  it('is an array', function () {
    expect([room.robot.brain.data.user_tasks]).to.be.an('array');
  });
});

describe('assign task:', function () {

  context('hubot adds the user if the user doesnt exist', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [];
    });
    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('abi@cisco.com', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['new task'] };

      expect(room.robot.brain.data.user_tasks).to.not.include(actual);
      return room.user.say('abi', '@hubot assign task:" new task " to abi@cisco.com').then(function () {
        expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
      });
    });

  });

  context('to a new user', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [];
    });
    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('assign new task', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['project sizing'] };
      var actual_msgs = [
        ['abi', '@hubot assign task:"project sizing" to abi@cisco.com'],
        ['hubot', 'task:"project sizing" is added to abi@cisco.com']
      ];

      expect(room.robot.brain.data.user_tasks).to.not.include(actual);
      return room.user.say('abi', '@hubot assign task:"project sizing" to abi@cisco.com').then(function () {
        expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
        expect(room.messages).to.deep.equal(actual_msgs);
      });
    });
  });

  context('to an existing user', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [
        {
          email: 'abi@cisco.com',
          tasks: [
            'project sizing',
            'coding'
          ]
        }
      ];
    });
    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('assign new task', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['project sizing', 'coding', 'application designing'] };
      var actual_msgs = [
        ['abi', '@hubot assign task:"application designing" to abi@cisco.com'],
        ['hubot', 'task:"application designing" is added to abi@cisco.com']
      ];
      expect(room.robot.brain.data.user_tasks).to.not.include(actual);
      return room.user.say('abi', '@hubot assign task:"application designing" to abi@cisco.com').then(function () {
        expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
        expect(room.messages).to.deep.equal(actual_msgs);
      });
    });

    it('assign multiple new tasks in a row', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['project sizing', 'coding', 'application designing', 'documentation'] };
      var actual_msgs = [
        ['abi', '@hubot assign task:"application designing" to abi@cisco.com'],
        ['hubot', 'task:"application designing" is added to abi@cisco.com'],
        ['abi', '@hubot assign task:"documentation" to abi@cisco.com'],
        ['hubot', 'task:"documentation" is added to abi@cisco.com']
      ];

      expect(room.robot.brain.data.user_tasks).to.not.include(actual);
      return room.user.say('abi', '@hubot assign task:"application designing" to abi@cisco.com')
        .then(function () {
          return room.user.say('abi', '@hubot assign task:"documentation" to abi@cisco.com');
        })
        .then(function () {
          expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
          expect(room.messages).to.deep.equal(actual_msgs);
        });
    });

    it('assign existing task', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['project sizing', 'coding'] };
      var actual_msgs = [
        ['abi', '@hubot assign task:"project sizing" to abi@cisco.com'],
        ['hubot', 'task:"project sizing" is already assigned to abi@cisco.com']
      ];
      return room.user.say('abi', '@hubot assign task:"project sizing" to abi@cisco.com').then(function () {
        expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
        expect(room.messages).to.deep.equal(actual_msgs);
      });
    });

    it('assign multiple existing tasks in a row', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['project sizing', 'coding'] };
      var actual_msgs = [
        ['abi', '@hubot assign task:"project sizing" to abi@cisco.com'],
        ['hubot', 'task:"project sizing" is already assigned to abi@cisco.com'],
        ['abi', '@hubot assign task:"coding" to abi@cisco.com'],
        ['hubot', 'task:"coding" is already assigned to abi@cisco.com']
      ];
      return room.user.say('abi', '@hubot assign task:"project sizing" to abi@cisco.com')
        .then(function () {
          return room.user.say('abi', '@hubot assign task:"coding" to abi@cisco.com');
        })
        .then(function () {
          expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
          expect(room.messages).to.deep.equal(actual_msgs);
        });
    });

  });
});

describe('get all tasks:', function () {
  context('of an existing user', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [
        {
          email: 'abi@cisco.com',
          tasks: [
            'project sizing',
            'coding'
          ]
        }
      ];
    });
    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('when tasks are assigned', function () {
      var actual = [
        ['abi', '@hubot show tasks of abi@cisco.com'],
        ['hubot', 'Tasks assigned to abi@cisco.com: project sizing, coding']
      ];

      return room.user.say('abi', '@hubot show tasks of abi@cisco.com').then(function () {
        expect(room.messages).to.deep.equal(actual);
      });

    });

    it('when no tasks are assigned', function () {
      room.robot.brain.data.user_tasks[0].tasks = [];
      var actual = [
        ['abi', '@hubot show tasks of abi@cisco.com'],
        ['hubot', 'No tasks assigned to abi@cisco.com']
      ];

      return room.user.say('abi', '@hubot show tasks of abi@cisco.com').then(function () {
        expect(room.messages).to.deep.equal(actual);
      });

    });
  });

  context('of a new user', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [{ email: 'abi@cisco.com', tasks: [] }];
    });
    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('responds no taks assigned', function () {
      var actual = [
        ['abi', '@hubot show tasks of nouser@cisco.com'],
        ['hubot', 'No user found with email - nouser@cisco.com']
      ];

      return room.user.say('abi', '@hubot show tasks of nouser@cisco.com').then(function () {
        expect(room.messages).to.deep.equal(actual);
      });

    });
  });
});

describe('withdraw task:', function () {

  context('from an existing user', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [
        {
          email: 'abi@cisco.com',
          tasks: [
            'project sizing',
            'coding'
          ]
        }
      ];
    });

    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('single task', function () {
      var actual = { email: 'abi@cisco.com', tasks: ['project sizing'] };
      var actual_msgs = [
        ['abi', '@hubot revoke task:"coding" of abi@cisco.com'],
        ['hubot', 'task:"coding" withdrawn']
      ];

      return room.user.say('abi', '@hubot revoke task:"coding" of abi@cisco.com')
        .then(function () {
          expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
          expect(room.messages).to.deep.equal(actual_msgs);
        });

    });

    it('multiple tasks in a row', function () {
      var actual = { email: 'abi@cisco.com', tasks: [] };
      var actual_msgs = [
        ['abi', '@hubot revoke task:"coding" of abi@cisco.com'],
        ['hubot', 'task:"coding" withdrawn'],
        ['abi', '@hubot revoke task:"project sizing" of abi@cisco.com'],
        ['hubot', 'task:"project sizing" withdrawn']
      ];

      return room.user.say('abi', '@hubot revoke task:"coding" of abi@cisco.com')
        .then(function () {
          return room.user.say('abi', '@hubot revoke task:"project sizing" of abi@cisco.com');
        })
        .then(function () {
          expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
          expect(room.messages).to.deep.equal(actual_msgs);
        });

    });

    it('when no tasks assigned', function () {
      var actual = { email: 'abi@cisco.com', tasks: [] };
      var actual_msgs = [
        ['abi', '@hubot revoke task:"coding" of abi@cisco.com'],
        ['hubot', 'task:"coding" withdrawn'],
        ['abi', '@hubot revoke task:"project sizing" of abi@cisco.com'],
        ['hubot', 'task:"project sizing" withdrawn'],
        ['abi', '@hubot revoke task:"notask" of abi@cisco.com'],
        ['hubot', 'task:"notask" is not assigned to abi@cisco.com']
      ];

      return room.user.say('abi', '@hubot revoke task:"coding" of abi@cisco.com')
        .then(function () {
          return room.user.say('abi', '@hubot revoke task:"project sizing" of abi@cisco.com');
        })
        .then(function () {
          return room.user.say('abi', '@hubot revoke task:"notask" of abi@cisco.com');
        })
        .then(function () {
          expect(room.robot.brain.data.user_tasks[0]).to.deep.equal(actual);
          expect(room.messages).to.deep.equal(actual_msgs);
        });

    });
  });

  context('from a new user', function () {
    var room = null;
    beforeEach(function () {
      room = tasksSparkHelper.createRoom();
      room.robot.brain.data.user_tasks = [];
    });

    afterEach(function () {
      room.robot.brain.data.user_tasks = null;
      room.destroy();
    });

    it('says no user found', function () {
      var actual_msgs = [
        ['abi', '@hubot revoke task:"coding" of abi@cisco.com'],
        ['hubot', 'No user found with email - abi@cisco.com']
      ];

      return room.user.say('abi', '@hubot revoke task:"coding" of abi@cisco.com')
        .then(function () {
          expect(room.robot.brain.data.user_tasks.length).to.equal(0);
          expect(room.messages).to.deep.equal(actual_msgs);
        });
    });

  });

});










