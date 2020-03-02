var _ = require('lodash');

module.exports = {
  improve: 'apostrophe-pieces',
  construct: function(self, options) {
    var superGetManagerControls = self.getManagerControls;
    self.getManagerControls = function(req) {
      var controls = superGetManagerControls();
      if (!self.orderings) {
        return controls;
      }
      if (!self.apos.permissions.can(req, 'edit-' + self.orderings.name)) {
        return controls;
      }
      var index = _.findIndex(controls, { action: 'cancel' });
      // The return value -1 works out fine here: insert at the beginning
      controls.splice(
        index + 1,
        0,
        {
          type: 'minor',
          name: 'orderings',
          label: 'Orderings',
          action: 'manage-' + self.apos.utils.cssName(self.orderings.name)
        }
      );
      return controls;
    };
  }
};
