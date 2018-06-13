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

## How to use it

First, click on your piece type in the admin bar (let's say it's "Articles").

Now, in the "Manage" dialog box, click the new "Orderings" button:

<img src="https://raw.githubusercontent.com/apostrophecms/apostrophe-pieces-orderings-bundle/master/images/click-orderings-button.png" />

A new "Manage" view appears, for managing your orderings. Click the "Add Ordering" button:

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/add-ordering-button.png?raw=true" />

Give your ordering a name, such as "Default Ordering" or "Holiday Season Ordering," then click the "Browse" button to choose items and order them:

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/browse-items-button.png?raw=true" />

Select items as you normally would and use the arrows or drag to reorder them. Then click "Save Choices:"

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/select-items.png?raw=true" />

If you want your ordering to be the default ordering, meaning that it is the default sort order everywhere, including in the "Manage" view, select "Yes" for the "Default" option:

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/default.png?raw=true" />

Now save your ordering and click "Finished" to return to "Manage Pieces."

If you made it the default ordering, the "manage" view of your pieces will immediately reflect it:

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/manage-view-with-default-order.png?raw=true" />

If your ordering is not to be the default ordering, you can choose it in the Page Settings of a pieces page such as a blog or events page:

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/page-settings.png?raw=true" />

It then takes effect just for the display of pieces on that one page. The ordered pieces appear first, followed by all other pieces in their default sort order. You can use the `_viaOrdering` boolean property to call them out visually in your templates, if you want to.

You can also select "Ordering" for a pieces widget, such as a blog widget. In this case, only the pieces in the ordering are displayed. However you can still set a limit to display only the top 5 or similar, as you might have dozens of pieces in an ordering:

<img src="https://raw.github.com/punkave/apostrophe-pieces-orderings-bundle/master/images/widget.png?raw=true" />

Enjoy!

