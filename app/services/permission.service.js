var permissions = {};

var PermissionService = {
  setAllowed: function(key, allowed) {
    permissions[key] = allowed;
  },
  isAllowed: function(key) {
    return permissions[key] != undefined ? permissions[key] : true;
  }
};

module.exports = PermissionService;
