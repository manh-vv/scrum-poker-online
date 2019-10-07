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
      return {};
    },
    props: ['name'],
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
        rooms: [],
      },

      /**
       * Object contains information of current working room
       */
      curRoom: null,
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
        const idx = this.availableRoom.rooms.findIndex(
          r => r.name === roomName
        );
        if (idx !== -1) {
          console.error('Room with the same name had been existed');
          return;
        }

        // create member object
        this.curRoom = createRoomObj({ name: roomName });

        // update available rooms
        this.availableRoom.rooms.push(this.curRoom);

        this.addMeAsMember(roomName, yourName, true);
      },

      /**
       * join a existing room
       * this function can be aliased by joinRoom
       *
       * @param roomName room name
       * @param yourName your user name
       * @param isAdmin true if you want to set user as admin of the room
       */
      addMeAsMember: function(roomName, yourName, isAdmin) {
        const room = (this.curRoom = this.availableRoom.rooms.find(
          r => r.name === roomName
        ));

        if (!room) {
          console.error('Room with name %s does not exist', roomName);
          return;
        }

        // reject if member with the same name had been existed
        const idx = room.joinedMembers.findIndex(m => m.name === yourName);
        if (idx !== -1) {
          console.error('Member with the same name had been existed', yourName);
          return;
        }

        // create member object
        this.me = createUserObj({
          name: yourName,
          type: isAdmin ? 'admin' : undefined,
        });

        // update joined members
        room.joinedMembers.push(this.me);
      },

      /**
       * left room
       *
       * @param roomName name of room
       */
      leftRoom: function(roomName) {
        // TODO left room
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
    joinedMembers: [],
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
