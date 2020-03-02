var assert = require('assert');
var _ = require('lodash');

describe('apostrophe-pieces-orderings-bundle', function() {

  var apos;
  var ids = [];
  var nonDefaultOrdering;

  this.timeout(5000);

  after(function(done) {
    require('apostrophe/test-lib/util').destroy(apos, done);
  });

  it('should be a property of the apos object', function(done) {
    apos = require('apostrophe')({
      testModule: true,
      baseUrl: 'http://localhost:7780',
      modules: {
        'apostrophe-express': {
          port: 7780
        },

        'apostrophe-pieces-orderings-bundle': {},

        'apostrophe-pages': {
          park: [
            {
              title: 'Tab One',
              type: 'default',
              slug: '/tab-one',
              _children: [
                {
                  title: 'Tab One Child One',
                  type: 'default',
                  slug: '/tab-one/child-one'
                },
                {
                  title: 'Tab One Child Two',
                  type: 'default',
                  slug: '/tab-one/child-two'
                }
              ]
            },
            {
              title: 'Tab Two',
              type: 'default',
              slug: '/tab-two',
              _children: [
                {
                  title: 'Tab Two Child One',
                  type: 'default',
                  slug: '/tab-two/child-one'
                },
                {
                  title: 'Tab Two Child Two',
                  type: 'default',
                  slug: '/tab-two/child-two'
                }
              ]
            },
            {
              title: 'Products',
              type: 'products-page',
              slug: '/products'
            }
          ],
          types: [
            {
              name: 'home',
              label: 'Home'
            },
            {
              name: 'default',
              label: 'Default'
            },
            {
              name: 'products',
              label: 'Products'
            }
          ]
        },
        products: {
          extend: 'apostrophe-pieces',
          name: 'product',
          sort: { title: 1 }
        },
        'products-orderings': {
          extend: 'apostrophe-pieces-orderings'
        },
        'products-pages': {
          extend: 'apostrophe-pieces-pages',
          orderings: true
        },
        'products-widgets': {
          orderings: true
        }
      },
      afterInit: function(callback) {
        assert(apos.modules['products-orderings']);
        return callback(null);
      },
      afterListen: function() {
        done();
      }
    });
  });

  it('insert many test products', function() {
    var total = 50;
    var i = 1;
    return insertNext();
    function insertNext() {
      var product = _.assign(apos.modules.products.newInstance(), {
        title: 'Cheese #' + padInteger(i, 5),
        slug: 'cheese-' + padInteger(i, 5)
      });
      return apos.modules.products.insert(apos.tasks.getReq(), product).then(function() {
        i++;
        if (i <= total) {
          return insertNext();
        }
        return true;
      });
    }
  });

  it('get the first ten without an ordering', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).toArray().then(function(products) {
      var i;
      for (i = 1; (i < 10); i++) {
        assert(products[i - 1].title === ('Cheese #' + padInteger(i, 5)));
        ids.push(products[i - 1]._id);
      }
      return true;
    });
  });

  it('get the first ten with search and without an ordering', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).search('cheese').toArray().then(function(products) {
      var i;
      for (i = 1; (i < 10); i++) {
        assert(products[i - 1].title === ('Cheese #' + padInteger(i, 5)));
        ids.push(products[i - 1]._id);
      }
      return true;
    });
  });

  it('create a default ordering', function() {
    var orderings = apos.modules['products-orderings'];
    var ordering = orderings.newInstance();
    ordering.piecesIds = [ids[1], ids[3], ids[5], ids[7]];
    ordering.default = true;
    ordering.published = true;
    ordering.title = 'Default Ordering';
    return orderings.insert(apos.tasks.getReq(), ordering);
  });

  it('get the first ten with default ordering', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).toArray().then(function(products) {
      assert(products[0].title === 'Cheese #00002');
      assert(products[1].title === 'Cheese #00004');
      assert(products[2].title === 'Cheese #00006');
      assert(products[3].title === 'Cheese #00008');
      assert(products[4].title === 'Cheese #00001');
      assert(products[5].title === 'Cheese #00003');
      assert(products[6].title === 'Cheese #00005');
      assert(products[7].title === 'Cheese #00007');
      assert(products[8].title === 'Cheese #00009');
      assert(products[9].title === 'Cheese #00010');
      return true;
    });
  });

  it('get the first ten with search and ordering', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).search('cheese').toArray().then(function(products) {
      assert(products.length === 10);
      // Order not significant but would favor text match
      return true;
    });
  });

  it('get the second ten with default ordering', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).skip(10).toArray().then(function(products) {
      var i;
      for (i = 11; (i <= 20); i++) {
        assert(products[i - 11].title === ('Cheese #' + padInteger(i, 5)));
      }
      return true;
    });
  });

  it('get the first ten with default ordering suppressed', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).ordering(false).toArray().then(function(products) {
      var i;
      for (i = 1; (i < 10); i++) {
        assert(products[i - 1].title === ('Cheese #' + padInteger(i, 5)));
        ids.push(products[i - 1]._id);
      }
      return true;
    });
  });

  it('create a non-default ordering', function() {
    var orderings = apos.modules['products-orderings'];
    nonDefaultOrdering = orderings.newInstance();
    nonDefaultOrdering.piecesIds = [ids[0], ids[2], ids[4], ids[6]];
    nonDefaultOrdering.published = true;
    nonDefaultOrdering.title = 'Non-Default Ordering';
    return orderings.insert(apos.tasks.getReq(), nonDefaultOrdering);
  });

  it('get the first ten with non-default ordering', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).ordering(nonDefaultOrdering).toArray().then(function(products) {
      assert(products[0].title === 'Cheese #00001');
      assert(products[1].title === 'Cheese #00003');
      assert(products[2].title === 'Cheese #00005');
      assert(products[3].title === 'Cheese #00007');
      assert(products[4].title === 'Cheese #00002');
      assert(products[5].title === 'Cheese #00004');
      assert(products[6].title === 'Cheese #00006');
      assert(products[7].title === 'Cheese #00008');
      assert(products[8].title === 'Cheese #00009');
      assert(products[9].title === 'Cheese #00010');
      return true;
    });
  });

  it('get the first ten with default ordering (not inadvertently overridden by non-default)', function() {
    return apos.modules.products.find(apos.tasks.getAnonReq(), {}).limit(10).toArray().then(function(products) {
      assert(products[0].title === 'Cheese #00002');
      assert(products[1].title === 'Cheese #00004');
      assert(products[2].title === 'Cheese #00006');
      assert(products[3].title === 'Cheese #00008');
      assert(products[4].title === 'Cheese #00001');
      assert(products[5].title === 'Cheese #00003');
      assert(products[6].title === 'Cheese #00005');
      assert(products[7].title === 'Cheese #00007');
      assert(products[8].title === 'Cheese #00009');
      assert(products[9].title === 'Cheese #00010');
      return true;
    });
  });

});

function padInteger(i, places) {
  var s = i + '';
  while (s.length < places) {
    s = '0' + s;
  }
  return s;
}
