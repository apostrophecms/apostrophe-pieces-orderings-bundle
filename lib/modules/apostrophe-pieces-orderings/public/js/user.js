apos.define('apostrophe-pieces-orderings', {
  extend: 'apostrophe-pieces',
  construct: function(self, options) {
    apos.on('change', function(what) {
      if (what === self.options.name) {
        // So the manage view of the piece refreshes too
        apos.change(self.options.piecesModuleName);
      }
    });
  }
});
