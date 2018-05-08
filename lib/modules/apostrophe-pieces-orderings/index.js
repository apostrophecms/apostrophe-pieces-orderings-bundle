module.exports = {
  extend: 'apostrophe-pieces',
  seo: false,
  sitemap: false,
  beforeConstruct: function(self, options) {
    options.piecesModuleName = options.piecesModuleName || self.__meta.name.replace(/-orderings$/, '');
    var pieces = options.apos.modules[options.piecesModuleName];
    if (!pieces) {
      throw new Error('Cannot figure out the right pieces module name from the name of the module ' + self.__meta.name + ', configure it AFTER your pieces module and, if necessary, specify the piecesModuleName option');
    }
    options.name = pieces.name + '-ordering';
    options.addFields = [
      {
        name: '_pieces',
        type: 'joinByArray',
        withType: pieces.name,
        help: 'Select items and place them in your preferred order. Any items not specified will be displayed after those specified.'
      },
      {
        name: 'default',
        type: 'boolean',
        def: false,
        help: 'Only one ordering can be the default. The default ordering is used in the "Manage" view and for all queries that do not specify another ordering.'
      }
    ].concat(options.addFields || []);
    options.removeFields = [ 'slug', 'tags' ].concat(options.removeFields || []);
    options.arrangeFields = [
      {
        name: 'basics',
        label: 'Basics',
        fields: [ 'title', '_pieces', 'default', 'trash', 'published' ]
      }
    ].concat(options.arrangeFields || []);
  },
  construct: function(self, options) {
    var pieces = self.apos.modules[options.piecesModuleName];
    pieces.orderings = self;
    self.addToAdminBar = function() {};
  }
};
