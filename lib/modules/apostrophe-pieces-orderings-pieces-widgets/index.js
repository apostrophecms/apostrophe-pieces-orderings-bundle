var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
  improve: 'apostrophe-pieces-widgets',
  afterConstruct: function(self) {
    if (self.options.orderings) {
      self.orderingsAddOption();
    }
  },
  construct: function(self, options) {
    if (options.orderings) {
      if (self.pieces && self.pieces.orderings) {
        self.orderingsAddOption = function() {
          var by = _.find(self.schema, { name: 'by' });
          if (!by) {
            return;
          }
          by.choices.push({
            label: 'Ordering',
            value: 'ordering',
            showFields: ['_ordering', 'limitByOrdering']
          });
          self.schema.push({
            type: 'joinByOne',
            name: '_ordering',
            label: 'Ordering',
            withType: self.pieces.orderings.name
          });
          self.schema.push({
            type: 'integer',
            name: 'limitByOrdering',
            label: 'Maximum displayed',
            help: 'If 0 or no value is given, all of the ordered items are displayed.',
            required: false
          });
        };
        var superLoadOne = self.loadOne;
        self.loadOne = function(req, widget, callback) {
          if (widget.by !== 'ordering') {
            return superLoadOne(req, widget, callback);
          }
          return Promise.try(function() {
            return self.pieces.orderings.find(req, { _id: widget.orderingId }).joins(false).toObject();
          }).then(function(ordering) {
            if (!ordering) {
              // Selected ordering is not available (trash, unpublished, who knows)
              return [];
            }
            var cursor = self.pieces.find(req).ordering(ordering);
            if (widget.limitByOrdering > 0) {
              cursor.limit(Math.min(widget.limitByOrdering, ordering.piecesIds.length));
            } else {
              cursor.limit(ordering.piecesIds.length);
            }
            return cursor.toArray();
          }).then(function(pieces) {
            // An ordered piece could become unavailable, for instance through
            // permissions or the trash can, so our limit could be too high.
            // Don't allow this to make unordered pieces visible at the end of the widget
            pieces = _.filter(pieces, function(piece) {
              return piece._viaOrdering;
            });
            widget._pieces = pieces;
            return callback(null);
          }).catch(function(err) {
            return callback(err);
          });
        };
      } else {
        throw new Error('Unable to find an orderings module that corresponds to the piece type associated with ' + self.__meta.name + '. Make sure you initialize your orderings module before this module.');
      }
    }
  }
};
