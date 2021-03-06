## Changelog

### 2.1.3: fixed a bug introduced in 2.1.2. This bug resulted in a crash on certain queries.

### 2.1.2: do not crash if a sort based on a text search is present. Also, if the specified sort involves a text search, disable the ordering and sort on match quality as Apostrophe normally does in this situation. As elsewhere in Apostrophe, this is done because the results of a text search without sorting on match quality are extremely poor (single-word matches far down the page might appear first, for instance).

### 2.1.1: Disables `apostrophe-open-graph` fields on the pieces module.

### 2.1.0: fixed significant performance issue caused by simultaneous attempts to fetch the `global` doc in order to find default orderings. **You must also upgrade apostrophe to version 2.85.0 or better** for this version to work properly.

### 2.0.3: bug fixed in which `req` was not passed on to the parent class version of `getCreateSingletonOptions`, leading to crashes in certain situations.

### 2.0.2: documentation includes examples for editors; changed browse button label from "Pieces" to "Items" as "Pieces" is not usually language shared with editors. No other code changes.

### 2.0.1: packaging issues only. No code changes.

### 2.0.0: initial release.

