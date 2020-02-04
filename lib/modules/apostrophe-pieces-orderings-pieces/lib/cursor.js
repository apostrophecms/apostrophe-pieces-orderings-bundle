var async = require('async');
var _ = require('lodash');

module.exports = {
  construct: function(self) {

    self.addFilter('ordering', {
      def: true
      // real work is done in lowLevelMongoCursor override
    });

    var superLowLevelMongoCursor = self.lowLevelMongoCursor;
    self.lowLevelMongoCursor = function(req, criteria, projection, options) {

      if (
        (self.options.module && (self.options.module.name === 'apostrophe-global')) ||
        (options.limit === 0) ||
        (!self.get('ordering'))
      ) {
        return superLowLevelMongoCursor(req, criteria, projection, options);
      }

      return {

        toArray: function(callback) {

          if (!callback) {
            return Promise.promisify(body)();
          }

          return body(callback);

          function body(callback) {
            if (self.get('ordering') === true) {
              // Default ordering requires global doc, which might not
              // be present in req in a task context. We look at `req.aposGlobalCore`
              // because it is populated *before* any joins from global are loaded, avoiding
              // recursion and race conditions. The default orderings live directly in
              // the global doc and don't have to wait for the joins
              if (!req.aposGlobalCore) {
                return self.apos.global.addGlobalToData(self.get('req'), body);
              } else {
                return body(null);
              }
              function body(err) {
                if (err) {
                  return callback(err);
                }
                // Might or might not have a default ordering, find out
                self.set('ordering', req.aposGlobalCore && req.aposGlobalCore.piecesOrderings && req.aposGlobalCore.piecesOrderings[self.options.module.name]);
                if (!self.get('ordering') && (!options.sort || (options.sort && !options.sort.textScore))) {
                  return superLowLevelMongoCursor(req, criteria, projection, options).toArray(callback);
                }
                // Yes we have the default ordering now
                return inner(callback);
              }
            } else {
              // Already a particular ordering object
              return inner(callback);
            }
          }

          function inner(callback) {

            // Get ALL of the ordered ids matching full query that are ordered
            // Put those in order
            //
            // Fetch the desired subset of the actual data, using $in, not skip and limit
            //
            // If no limit, or limit exceeds docs returned,
            // fetch unordered docs too, using $nin based on
            // all of the unordered ids, not just those of full docs fetched.
            // Use skip and limit as/if still appropriate

            var results = [];
            var realIds = [];

            return async.series([
              getRealIds,
              getSubset,
              getUnordered
            ], function(err) {
              return callback(err, results);
            });

            function getRealIds(callback) {
              var ids = self.get('ordering').piecesIds;
              if (!ids.length) {
                return callback(null);
              }
              var _criteria = {
                $and: [
                  criteria,
                  {
                    _id: { $in: ids }
                  }
                ]
              };
              return superLowLevelMongoCursor(req, _criteria, { _id: 1 }, _.omit(options, 'skip', 'limit', 'sort')).toArray(function(err, docs) {
                if (err) {
                  return callback(err);
                }
                docs = self.apos.utils.orderById(ids, docs);
                realIds = docs.map(function(doc) {
                  return doc._id;
                });
                return callback(null);
              });
            }

            function getSubset(callback) {
              var _realIds = realIds;
              if (options.skip) {
                _realIds = _realIds.slice(options.skip);
              }
              if (options.limit) {
                _realIds = _realIds.slice(0, options.limit);
              }
              if (!_realIds.length) {
                return callback(null);
              }
              return superLowLevelMongoCursor(req, {
                _id: {
                  $in: _realIds
                }
              }, projection, _.omit(options, 'skip', 'limit')).toArray(function(err, docs) {
                if (err) {
                  return callback(err);
                }
                docs = self.apos.utils.orderById(realIds, docs);
                _.each(docs, function(doc) {
                  // So you can call them out visually if you wish
                  doc._viaOrdering = true;
                });
                results = results.concat(docs);
                return callback(null);
              });
            }

            function getUnordered(callback) {
              var _criteria = {
                $and: [
                  criteria,
                  {
                    _id: { $nin: realIds }
                  }
                ]
              };
              if (options.limit && (results.length >= options.limit)) {
                return callback(null);
              }
              var _options = _.clone(options);
              if (_options.limit) {
                _options.limit -= results.length;
              }
              if (_options.skip) {
                if (_options.skip > realIds.length) {
                  _options.skip = _options.skip - realIds.length;
                } else {
                  _options.skip = 0;
                }
              }
              return superLowLevelMongoCursor(
                req,
                _criteria,
                projection,
                _options
              ).toArray(function(err, docs) {
                if (err) {
                  return callback(err);
                }
                results = results.concat(docs);
                return callback(null);
              });
            }
          }
        },
        count: function(callback) {
          if (!callback) {
            return Promise.promisify(body)();
          }
          return body(callback);
          function body(callback) {
            return superLowLevelMongoCursor(req, criteria, projection, options).count(callback);
          }
        }
      };
    };
  }

};
