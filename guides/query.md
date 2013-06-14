# Queries

Queries are one of the most powerful things in tower. They are the interface between resources and adapters, making it possible to find/create/update/remove records across adapters using a standard syntax.

Tower's query API is very similar to most SQL-like query languages. As it turns out, even NoSQL databases like Cassandra and Neo4j have SQL-like query languages. The reason is, when you start talking about resources with attributes, and relationships between resources, it all boils down to [set theory](http://en.wikipedia.org/wiki/Set_theory), or more specifically [graph theory](http://en.wikipedia.org/wiki/Graph_theory) and [relational algebra](http://en.wikipedia.org/wiki/Relational_algebra). I'm not sure the formal relationship between these different areas of mathematics, but they all are required areas of study when building a query language.

In the most general sense, a query is a set of constraints applied to a graph, where the graph is all of the resources and attributes, and the constraints are [linear inequalities](http://en.wikipedia.org/wiki/Linear_inequality) such as `posts.likeCount >= 10`. The query analyzer then figures out the most optimal way to traverse the graph of resources and attributes (across adapters) and builds a [query plan](http://en.wikipedia.org/wiki/Query_plan): the most optimal way to traverse the graph given those constraints.

This is what Tower's query engine does. You build a query, which get's compiled to a "topology" (the most optimal map/way to traverse your graph of resources across adapters), and then performs the queries on the adapters. You get back the final result. You don't need to worry at all about the database-specific implementations.

## Query API

This is the basic api for the query object:

```js
var query = require('tower-query');

query()
  .select('post')
  .where('likeCount').gte(10)
  .limit(20)
  .desc('createdAt')
  .page(2)
  .all();
```

It is very similar to a SQL query.

There are 4 main properties on the query object:

- `query.selects`: an array of all the tables/collections/keystores (i.e. resources) used in the query
- `query.constraints`: an array of `<left> <operator> <right>` statements like `likeCount >= 10` (as objects, so they're easy to manipulate)
- `query.paging`: the `limit` and `offset` values specified, if any
- `query.sorting`: an array of the different sorting properties/directions

These properties store the parameters passed in through the query DSL.

Queries are tied to both resources and adapters.

## Queries and Adapters

The query module defines exports a `use` method, to which adapters are passed. By telling the query to "use adapters", you tell the query system what data it has access to.

When you define an adapter, `use` gets called automatically for you. You can also tell a specific query instance which adapters to use in the same way (so you can say, "this query only has access to this specific adapter" for example).

You can access the query object from the adapter as well. We're moving to a point where you should be able to do this on all adapters:

```js
var facebook = require('facebook-adapter');

facebook('user').where(...).all();
```

Basically, that just delegates to the following (which _is_ possible now):

```js
var facebook = require('facebook-adapter');

facebook.query().select('user').where(...).all();
```

By having that simpler version, if you build a REST API for your startup or whatever, you will be able to have a simple/clean API for free, with a completely robust query API. You'd simply say "include our script tag on your site", and now customers are using your super lean, lightweight, robust JavaScript API.

## Queries and Resources

You can also access the query object from [resources](/guides#resources):

```js
var resource = require('tower-resource');

resource('user').where(...).all();
```

This just adds a `.select(resourceName)` to the query object, basically just this:

```js
var query = require('tower-query');

query().select('user');
```

## Queries and Relations

All of the theory has been fleshed out on how to robustly implement a generic query executor that works across all different types of databases (mysql, mongodb, cassandra, neo4j, etc.) and remote services (facebook, twitter, etc.). _And between adapters_, such as "fetch all facebook posts for users in our database who have signed up in the past 2 weeks" or whatever. Cross-adapter queries means, soon, you will be able to query anything, anywhere. This means that data objects everywhere can be queried and combined in new ways.

### The math

Basically, we have a graph `G` with vertices `V` and edges `E`:

```
G(V,E)
```

The vertices are the adapters `A`, resources `R`, and resource attributes ("fields", `F`). So, they are _subsets of `V`_.

```
A,R,F ⊂ V
```

where

```
{ adapter('mongodb'), adapter('cassandra'), ... } ∈ A
```

Also, `R` is a collection of subsets of `A` (don't know how to quite represent this yet).

Then `F` is the same, a collection of subsets grouped by `R`.

So then it comes down to, a _query_ is just a set of edge constraints on `V`.

Simple constraints are when a property is set to a primitive value such as a string/number/etc. I'm not sure those need to be treated as nodes so I'm ignoring them for now (that is, the database natively will handle all that stuff).

Complex constraints are basically _joins_, where the value is pointing to a resource field, `F`. That is, it is an edge between 2 or more resource fields, `Fi` to `Fn`.

This really simplifies everything. So basically, a bunch of joins just mean there's a bunch of edges between members of `F`, call them `J`.

```
J ⊂ E
```

That means (at least for reasonably complex queries), you just have to solve the _[minimum cut maximum network flow](http://en.wikipedia.org/wiki/Max-flow_min-cut_theorem) problem_ for the network `J`.

Somehow you can group `J` in an order based on the fact that they are connected to `F`, which are a subset of `R` which is a subset of `A`.

If you think of it in terms of 3 adapters, `facebook, twitter, mongodb`, and they all have their own `user` resource, and all have a `firstName` attribute, and maybe a couple more attributes each, and several of their attributes are joined together, how do you find the best way to do the query?

One issue is, there can't be any _directed cycles_. Realizing this simplified everything, because in my head I kept thinking of that case and not seeing a solution, but from what I've read they say _it must be a DAG_ (directed acyclic graph), no cycles! We can come back to handling the cyclic case later (maybe the algorithm can just randomly say one goes before the other).

So to figure out the best way to do the query, you have to figure out the network flow problem on `J ⊂ E`. That's pretty much it.

## Summary

Those are some notes on how to approach solving the problem. It's totally possible, should be able to complete soon. Would love any input.

So, the query system currently supports being infinitely extensible on individual adapters (which should be useful for you now), and in the works is making queries work cross-adapter, with relations.