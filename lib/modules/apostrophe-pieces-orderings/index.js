var _ = require('lodash');
var async = require('async');

module.exports = {
  extend: 'apostrophe-pieces',
  seo: false,
  openGraph: false,
  sitemap: false,
  beforeConstruct: function(self, options) {
    options.piecesModuleName = options.piecesModuleName || self.__meta.name.replace(/-orderings$/, '');
    var pieces = options.apos.modules[options.piecesModuleName];
    if (!pieces) {
      throw new Error('Cannot figure out the right pieces module name from the name of the module ' + self.__meta.name + ', configure it AFTER your pieces module and, if necessary, specify the piecesModuleName option');
    }
    options.pluralLabel = options.pluralLabel || (pieces.label + ' Orderings');
    options.name = pieces.name + '-ordering';
    options.addFields = [
      {
        name: '_pieces',
        label: 'Items',
        type: 'joinByArray',
        withType: pieces.name,
        help: 'Select items and place them in your preferred order. Any items not specified will be displayed after those specified.'
      },
      {
        name: 'default',
        label: 'Default',
        type: 'boolean',
        def: false,
        help: 'Only one ordering can be the default. The default ordering is used in the "Manage" view and for all queries that do not specify another ordering.'
      }
    ].concat(options.addFields || []);
    options.removeFields = ['slug', 'tags'].concat(options.removeFields || []);
    options.arrangeFields = [
      {
        name: 'basics',
        label: 'Basics',
        fields: ['title', '_pieces', 'default', 'trash', 'published']
      }
    ].concat(options.arrangeFields || []);
    options.addColumns = [
      {
        name: 'default',
        label: 'Default',
        partial: function(value) {
          if (value) {
            return '✅';
          } else {
            return '';
          }
        }
      }
    ].concat(options.addColumns || []);
  },
  construct: function(self, options) {
    var pieces = self.apos.modules[options.piecesModuleName];
    pieces.orderings = self;
    self.addToAdminBar = function() {};

    // Only one ordering can be the default ordering at any given time,
    // and that one must be mirrored to the global doc for performance.
    //
    // Use a callAll handler because these fire even if the doc is updated
    // via apos.docs.update, which workflow currently uses when exporting.

    self.docAfterSave = function(req, piece, options, callback) {

      if (self.name !== piece.type) {
        return callback(null);
      }

      return async.series([updateGlobal, updateOrderings], callback);

      function updateGlobal(callback) {
        // Don't rely on req.data.global, it might even be for another locale
        // if we're doing funny things to req in the middle of a workflow export
        var criteria = {
          type: 'apostrophe-global'
        };
        if (piece.workflowLocale) {
          criteria.workflowLocale = piece.workflowLocale;
        }
        var action = {};
        if (piece.default && piece.published && (!piece.trash)) {
          action = {
            $set: {}
          };
          action.$set['piecesOrderings.' + pieces.name] = _.pick(piece, '_id', 'piecesIds');
          return self.apos.docs.db.update(criteria, action, callback);
        } else {
          action = {
            $unset: {}
          };
          criteria['piecesOrderings.' + pieces.name + '._id'] = piece._id;
          action.$unset['piecesOrderings.' + pieces.name] = 1;
          return self.apos.docs.db.update(criteria, action, callback);
        }
      }

      function updateOrderings(callback) {
        if (!piece.default) {
          return callback(null);
        }
        var criteria = {
          type: self.name,
          _id: { $ne: piece._id }
        };
        if (piece.workflowLocale) {
          // Workflow-friendly
          criteria.workflowLocale = piece.workflowLocale;
        }
        return self.apos.docs.db.update(criteria, {
          $set: {
            default: false
          }
        }, {
          multi: true
        }, callback);
      }

    };

    // In this case afterSave behavior should also be applied after movement to trash

    self.afterTrash = function(req, id, callback) {
      return self.apos.docs.db.findOne({ _id: id }, function(err, doc) {
        if (err) {
          return callback(err);
        }
        if (!doc) {
          return callback(new Error('notfound'));
        }
        return self.docAfterSave(req, doc, {}, callback);
      });
    };

    // In this case afterSave behavior should also be applied after rescue from trash

    self.afterRescue = function(req, id, callback) {
      return self.apos.docs.db.findOne({ _id: id }, function(err, doc) {
        if (err) {
          return callback(err);
        }
        if (!doc) {
          return callback(new Error('notfound'));
        }
        return self.docAfterSave(req, doc, {}, callback);
      });
    };

    // Tell the browser about the corresponding pieces module
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function(req) {
      var options = superGetCreateSingletonOptions(req);
      options.piecesModuleName = self.options.piecesModuleName;
      return options;
    };

  }
};
