console.log('defining');
apos.define('apostrophe-pieces-orderings', {
  extend: 'apostrophe-pieces',
  construct: function(self, options) {
    apos.on('change', function(what) {
      console.log('firing');
      if (what === self.options.name) {
        console.log('relevant');
        // So the manage view of the piece refreshes too
        apos.change(self.options.piecesModuleName);
      }
    });
  }
});
