const firebase = require('firebase/app');
require('firebase/database');
// Set the configuration for your app
const config = {
  apiKey: 'AIzaSyBYIyAEnnZN6A158NXdkYN_D86qJxIQVw4',
  authDomain: 'scrum-poker-tada.firebaseapp.com',
  databaseURL: 'https://scrum-poker-tada.firebaseio.com',
  storageBucket: 'bucket.appspot.com',
};
firebase.initializeApp(config);

// Get a reference to the database service
exports.db = firebase.database();
