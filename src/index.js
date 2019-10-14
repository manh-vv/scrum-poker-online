require('./style.scss');
const { db } = require('./db');

const refAvailableRoom = db.ref('availableRoom/');

/**
 * run this function after document is loaded
 */
function onLoad() {
  console.debug('---- on load');
  Vue.component('form-create-room', {
    template: '#form-create-room',
    data: function() {
      return {
        roomName: '',
        yourName: '',
      };
    },
    methods: {
      onSubmit: function() {
        this.$root.createRoom(this.roomName, this.yourName);
      },
    },
  });

  Vue.component('card-room', {
    template: '#card-room',
    data: function() {
      return {
        yourName: '',
      };
    },
    props: ['name'],
    methods: {
      onSubmit: function() {
        this.$root.addMeAsMember(this.name, this.yourName, false, false);
      },
    },
  });

  Vue.component('card-user', {
    template: '#card-user',
    data: function() {
      return {};
    },
    props: ['name'],
  });

  new Vue({
    el: '#app',
    data: {
      /**
       * Object hold referrence to my user infor
       */
      me: null,

      /**
       * Array contains all available rooms
       */
      availableRoom: {
        /**
         * sync scope show how data is synced
         * `global` means all user can see
         * `room` means all member in room can see
         */
        syncScope: 'global',
        rooms: {},
      },

      /**
       * Object contains information of current working room
       */
      curRoom: null,
    },
    mounted: function() {
      const _this = this;
      _this.$nextTick(function() {
        refAvailableRoom.on('value', snapshot => {
          _this.availableRoom = {
            /**
             * sync scope show how data is synced
             * `global` means all user can see
             * `room` means all member in room can see
             */
            syncScope: 'global',
            rooms: {},
            ...snapshot.val(),
          };
        });
      });
    },
    methods: {
      /**
       * update estimation
       * @param point story point
       */
      updateEstimation: function(point) {
        this.me.point = point;
      },

      /**
       * use this function to publish estimation by changing state to ready
       * @param state user state
       */
      updateState: function(state = 'ready') {
        this.me.state = state;
      },

      /**
       * create room
       * @param roomName name of room
       * @param yourName your user's name
       */
      createRoom: function(roomName, yourName) {
        // reject if room had been existed
        if (this.availableRoom.rooms[roomName]) {
          console.error('Room with the same name had been existed');
          alert('Room with the same name had been existed');
          return;
        }

        // create member object
        this.curRoom = createRoomObj({ name: roomName });

        // update available rooms
        this.availableRoom.rooms[roomName] = this.curRoom;

        this.addMeAsMember(roomName, yourName, true, true);

        // sync global data
        refAvailableRoom.set(this.availableRoom);
      },

      /**
       * join a existing room
       * this function can be aliased by joinRoom
       *
       * @param roomName room name
       * @param yourName your user name
       * @param {boolean} disableSync true sync is turn off
       * @param isAdmin true if you want to set user as admin of the room
       */
      addMeAsMember: function(roomName, yourName, disableSync, isAdmin) {
        const room = this.availableRoom.rooms[roomName];

        if (!room) {
          console.error('Room with name %s does not exist', roomName);
          window.alert(`Room with name ${roomName} does not exist`);
          return;
        }

        // reject if member with the same name had been existed

        if (room.joinedMembers[yourName]) {
          console.error('Member with the same name had been existed', yourName);
          window.alert(
            'Member with the same name had been existed ' + yourName
          );
          return;
        }

        this.curRoom = room;

        // create member object
        this.me = createUserObj({
          name: yourName,
          role: isAdmin ? 'admin' : 'normal',
        });

        // update joined members
        room.joinedMembers[yourName] = this.me;

        if (!disableSync) {
          // sync global data
          refAvailableRoom.set(this.availableRoom);
        }
      },

      /**
       * left room
       *
       * @param roomName name of room
       */
      leftRoom: function(roomName) {
        const room = this.availableRoom.rooms[roomName];
        if (!room) {
          return;
        }

        if (!this.me) {
          return;
        }

        delete room.joinedMembers[this.me.name];

        // sync to db
        refAvailableRoom.set(this.availableRoom);
      },
    },
  });
}

/**
 * Run app after document is loaded
 */
document.addEventListener('DOMContentLoaded', onLoad);

/**
 * begin: helper functions
 *
 * @param name name of room
 *
 * @return room object
 */
function createRoomObj({ name }) {
  return {
    syncScope: 'room',
    name,

    /**
     * Array contains all member are joined to current room
     */
    joinedMembers: {},
  };
}

/**
 * `status` is used to show user status - value can be: estimating, ready
 * `point` is story point, type should be string because some time we use `infinite` as value
 * `role` shows how user role. Value can be: admin, normal.
 *
 * @param name name of user
 * @param point estimation point
 * @param status user's status
 * @param role user's role
 *
 * @return {role: string, name: *, point: string, status: string} object
 */
function createUserObj({
  name,
  point = '0.5h',
  status = 'estimating',
  role = 'normal',
}) {
  return { name, status, point, role };
}
/** end  : helper functions */
