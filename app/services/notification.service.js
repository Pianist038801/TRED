'use strict';

var localStorage = require('./localStorage.service');
var userService = require('./user.service');
var authService = require('./auth.service');
var navigationService = require('./navigation.service');
var {
  Platform,
  AppState,
  Alert,
} = require('react-native');

exports.initialize = function() {
  var Notifications;
  var registering;
  if (Platform.OS === 'android') {
    Notifications = require('react-native-android-notification');
  } else {
    Notifications = require('react-native').PushNotificationIOS;
    Notifications.requestPermissions();
  }

  Notifications.addEventListener('register', function didRegisterForRemote(token) {
    console.log('Received token from OS:', token);
    // This fixes a bug in React Native that causes two device registration events at nearly the same time
    // TODO: Test if this can be removed in RN 22
    if (registering) {
      console.log("Ignoring additional device token registration");
      return;
    }
    registering = true;
    setTimeout(function() {
      registering = false;
    }, 250);
    localStorage.get('DEVICE_TOKEN')
      .then(function(oldToken) {
        localStorage.set('DEVICE_TOKEN', token);
        return authService.isLoggedIn()
          .then(function(loggedIn) {
            // If we're logged in, register this device
            if (loggedIn) {
              return userService.registerDevice(oldToken, token);
            }
          });
      });
  });

  Notifications.addEventListener('notification', function receivedRemoteNotification(notification) {
    console.log('Received push notification:', notification.getMessage());

    var pushData = notification.getData();
    var route = {
      id: 'Dashboard',
      name: 'Dashboard',
    };
    if (pushData && pushData.metadata && pushData.metadata.listing_id) {
      if (pushData.metadata.testDriveID) {
        route = {
          id: "Listing",
          name: "Listing",
          vin: pushData.metadata.listing_id,
          initialTab: "testDrives"
        };
      } else if (pushData.metadata.thread_id) {
        route = {
          id: "Listing",
          name: "Listing",
          vin: pushData.metadata.listing_id,
          initialTab: "offers"
        };
      }
    }

    if (AppState.currentState === 'active' && Platform.OS === 'ios') {
      Alert.alert("", notification.getMessage(), [
        {
          text: "Ok"
        },
        {
          text: "View",
          onPress: () => {
            navigationService.goToRoute(route);
          }
        },
      ]);
    } else if (AppState.currentState !== 'active') {
      navigationService.goToRoute(route);
    }
  });
};

exports.scheduleSellReminder = function() {
  if (Platform.OS === 'android') {
    //AndroidNotification.cancelAllLocalNotifications();
    //AndroidNotification.scheduleLocalNotification({
    //  id: 1339,
    //  subject: 'Test Notification',
    //  message: 'This notification will show after 10 seconds',
    //  delay: 1000
    //});
  } else {
    //PushNotificationIOS.cancelAllLocalNotifications();
    //PushNotificationIOS.scheduleLocalNotification({
    //  fireDate: Date.now() + 5000,
    //  alertBody: "Don't forget to sell your car!",
    //  //soundName: require('../../sounds/honk.wav')
    //});
  }
};

exports.cancelSellReminder = function() {
  if (Platform.OS === 'android') {
    //AndroidNotification.cancelAllLocalNotifications();
  } else {
    //PushNotificationIOS.cancelAllLocalNotifications();
  }
};
