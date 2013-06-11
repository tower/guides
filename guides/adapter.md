# Adapters

Adapters are an abstraction over remote services and databases. This includes pretty much everything you can think of (and if there's a case this doesn't handle, definitely point it out):

- Databases like MySQL, MongoDB, Cassandra, Redis, etc.
- Remote services like Facebook, Twitter, and other things with API's (REST or not)
- Things without APIs that you can make have an API, such as web crawling
- Operating system resources like files, processes, installed packages, etc.

They make it possible to have a standard interface to any data, anywhere.

All it takes to implement an adapter is defining one method, `exec`. If you do this you can perform all the standard query actions (create/read/update/delete), and the resources your adapter abstracts become usable just like any other resource (like a **m**odel in traditional MVC frameworks like Rails).

Here's how the `exec` method looks for some custom adapter:

```js
var adapter = require('tower-adapter');

adapter('custom').exec = function(query, fn){
  
};
```

All it takes is a [query](/guides/queries) object, and a callback function (for handling async).

It is up to your specific adapter to determine how to handle the query object. To be brief (more in the [query section](/guides/queries)), the query object has the same basic stuff you'd find in any other database query system like SQL, MongoDB, etc.:

- `query.selects`: an array of all the tables/collections/keystores (i.e. resources) used in the query
- `query.constraints`: an array of `<left> <operator> <right>` statements like `likeCount >= 10` (as objects, so they're easy to manipulate)
- `query.paging`: the `limit` and `offset` values specified, if any
- `query.sorting`: an array of the different sorting properties/directions

Again, all of that is described in depth in the [query section](/guides/queries). For now just know that to implement a custom adapter, you simply implement the `exec` function, which means taking those 5 query properties and converting them into the format specific to some database or service.

## Implementing a REST adapter

Here's how the `exec` method looks for a custom REST adapter (which saves client-side records through AJAX to your server, and allows basic searching):

```js
/**
 * Map of query actions to HTTP methods.
 */

var methods = {
  find: 'GET',
  create: 'POST',
  update: 'PUT',
  remove: 'DELETE'
};

adapter('rest').exec = function(query, fn){
  var name = query.selects[0].resource;
  var method = methods[query.type];
  var params = serializeParams(query);

  $.ajax({
    url: '/api/' + name,
    dataType: 'json',
    type: method,
    data: params,
    success: function(data){
      fn(null, data);
    },
    error: function(data){
      fn(data);
    }
  });
};

/**
 * Convert query constraints into query parameters.
 */

function serializeParams(query) {
  var constraints = query.constraints;
  var params = {};

  constraints.forEach(function(constraint){
    // params['likeCount'] = 10;
    params[constraint.left.attr] = constraint.right.value;
  });

  return params;
}
```

Notice how small that is. Basically this is all it took to hook up your resources to a backend, with full search/sorting/pagination built in.

You can implement remote service and database adapters just as easily.

## Implementing a database adapter

This is just like implementing the REST adapter. All you do is implement the `exec` function, and convert the `query` object into the database-specific format.

Here is a high-level example of how to create a MySQL adapter:

```js
var adapter = require('tower-adapter');
var mysql = require('mysql');

adapter('mysql').exec = function(query, fn){
  var table = query.selects[0].resource;
  var constraint = query.constraints[0];
  var condition = [constraint.left.attr, constraint.operator, constraint.right.value].join(' ');

  var statement = [
    'SELECT * FROM ' + table  // SELECT * FROM posts
    'WHERE ' + constraint     // WHERE likeCount >= 10
  ];

  mysql.execute(statement, fn);
};
```

Tower has started creating a [MySQL adapter](https://github.com/tower/mysql-adapter) that shows more of the edge cases you might have to consider when you dig into it. But still, it's relatively simple. Now you can save and query any data in MySQL.

To really make a database adapter robust you would have to dig into the documentation for that specific database to make sure you support as much as possible in as efficient a way as possible. But know that, once you finish an adapter and open source that shit, you solved the problem for _everyone_, and you'll never have to deal with it again\*.

## Implementing a remote service adapter

No guides on this yet. For now, see the [EC2 adapter](https://github.com/tower/ec2-adapter) for the most complete example so far. Basically, in addition to making any database queryable, you can do that to remote services as well.

In the end, by having all of these adapters, everything will have one standard query API.

_\* That is, not counting the multiple refactorings and trying to make it the fastest adapter in the world :). And the occasional bug too. But assuming you spent some time making it quality, people will use your adapter and potentially contribute to it. The _hardcore_ bugs are left to the actual database engineers._