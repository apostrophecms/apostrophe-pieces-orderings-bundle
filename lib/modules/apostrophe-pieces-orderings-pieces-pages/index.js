module.exports = {
  improve: 'apostrophe-pieces-pages',
  construct: function(self, options) {
    if (options.orderings) {
      if (self.pieces && self.pieces.orderings) {
        self.options.addFields = [
          {
            type: 'joinByOne',
            name: '_ordering',
            withType: self.pieces.orderings.name,
            label: 'Manual Ordering',
            help: 'Items in the selected manual ordering will be listed first.'
          }
        ].concat(self.options.addFields || []);
      } else {
        throw new Error('Unable to find an orderings module that corresponds to the piece type associated with ' + self.__meta.name + '. Make sure you initialize your orderings module before this module.');
      }
    }
    var superIndexCursor = self.indexCursor;
    self.indexCursor = function(req) {
      var cursor = superIndexCursor(req);
      if (req.data.page && req.data.page._ordering) {
        cursor.ordering(req.data.page._ordering);
      }
      return cursor;
    };
  }
};
