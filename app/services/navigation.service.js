var navigator;
var navBar;
var currentRoute;

exports.registerNavigator = function(_navigator) {
  navigator = _navigator;
};

exports.registerNavBar = function(_navBar) {
  navBar = _navBar;
};

exports.setCurrentRoute = function(route) {
  currentRoute = route;
};

exports.showLogin = function(onLogin) {
  var route = {
    id: 'Login',
    name: 'Login',
    callbackRoute: currentRoute,
    onLogin: onLogin,
    goHome: false,
  };
  if (navigator) {
    if(currentRoute.id && currentRoute.id === 'Dashboard'){
      route.goHome = true;
      navigator.replace(route);
    } else {
      navigator.push(route);
    }
  }
};

exports.showNavBar = function() {
  if (navBar) {
    setTimeout(navBar.show);
  }
};

exports.hideNavBar = function() {
  if (navBar) {
    setTimeout(navBar.hide);
  }
};

exports.goToRoute = function(route) {
  navigator.push(route);
};
