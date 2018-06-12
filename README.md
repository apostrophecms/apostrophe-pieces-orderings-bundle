This module lets you manually assign an order to pieces. You can use such manually created orderings with `apostrophe-pieces-widgets`, `apostrophe-pieces-pages`, and your own code that fetches pieces via cursors.

And you can also choose to put one of the orders into effect as the "default ordering," meaning that it applies to all queries that don't specify an explicit sort or use their own ordering.

> In addition, your explicitly ordered pieces will have a `_viaOrdering` property set to `true`, so you can easily visually distinguish them in your `index.html` template if you choose.

With `apostrophe-pieces-pages`, the explicitly ordered pieces appear first, followed by the others in the default sort order for that type of piece. But, this is done with proper pagination. So you can use this module to "feature" pieces sitewide without worrying about duplication on every page.

With `apostrophe-pieces-widgets`, if the editor selects `Ordering` and chooses an ordering, then *only* pieces that are part of that ordering appear for that widget. Since you may have ordered many pieces, the editor can also set a limit to display only the top 5, etc.

## Usage

```javascript
        // in app.js, in the modules key

        // You must enable the bundle
        'apostrophe-pieces-orderings-bundle': {},
        // You must enable orderings for your pieces module
        'apostrophe-blog': {
          orderings: true
        },
        // You must have a -orderings module for each pieces module you wish to order
        'apostrophe-blog-orderings': {
          extend: 'apostrophe-pieces-orderings'
        },
        // You must enable orderings for your pieces-pages module if you wish it to
        // support choosing an ordering
        'apostrophe-blog-pages': {
          orderings: true
        },
        // You must enable orderings for your pieces-widgets module if you wish it to
        // support choosing an ordering
        'apostrophe-blog-widgets': {
          orderings: true
        },
```

Important notes:

* `apostrophe-pieces-orderings-bundle` should be configured early, before the piece types you wish to order.
* You must explicitly opt into the feature with `orderings: true` for each pieces, pieces-pages and pieces-widgets module for which you actually want it.
* If you have a module called `my-pieces` and you want to order them, then you must create a `my-pieces-orderings` module that extends `apostrophe-pieces-orderings`. If for some reason this naming convention does not work for you, you may set the `piecesModuleName` option explicitly, but that's a strange choice; just go with the convention.
* Only one ordering can have the "default" option set to "yes" at a time. All others are automatically reset to "no" when you save a new default.
