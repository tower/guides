## Resource

Data models that can be stored in any database or remote service using adapters.

```js
var resource = require('tower-resource');
```

attributes:

```js
resource('post')
  .attr('title') // defaults to 'string'
  .attr('body', 'text')
  .attr('published', 'boolean', false);
```

validations:

```js
resource('user')
  .attr('email')
    .validate('presence')
    .validate('isEmail')
    .validate('emailProvider', { in: [ 'gmail.com' ] }) // some hypothetical one
  .attr('username')
    .validator(function(val){
      return !!val.match(/[a-zA-Z]/);
    });
```

There are two DSL methods for validation.

1. `validate`: for using predefined validations (see [tower-validator](https://github.com/tower/validator)), purely to clean up the API.
2. `validator`: for defining custom validator functions right inline. If you want to reuse your custom validator function across resources, just move the function into tower-validator.

queries:

```js
resource('post')
  .where('published').eq(true)
  .all(function(err, posts){

  });
```

See [tower-query]() for the entire syntax. The `where` method just delegates to a `Query` instance. You can also access the query object directly (it just adds `.select(resourceName)` for you):

```js
resource('post').query().sort('title', -1).all();
```

actions:

There are 4 main actions for resources (which are just delegated to `query().action(name)`:

- create
- all
- update
- remove

```js
resource('post').create();
resource('post').all();
resource('post').update({ published: true });
resource('post').remove();
```

Under the hood, when you execute one of these actions, they get handled by a database-/service-specific adapter (mongodb, cassandra, facebook, etc.). Those adapters can perform optimizations such as streaming query results back.

## Adapter

Datastore abstraction layer.

To abstract out some database like Cassandra, a REST API like Facebook, or even something like plain web crawling, so that it can be queried like any other resource, just implement the `exec` method on a new adapter.

```js
var adapter = require('tower-adapter');
```

See one of these for a complete example:

- mongodb: https://github.com/tower/mongodb-adapter
- ec2: https://github.com/tower/ec2-adapter

Example custom REST adapter implementing the `exec` method:

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
    params[constraint.left.attr] = constraint.right.value;
  });

  return params;
}
```

Map REST API objects to resources:

```js
adapter('facebook')
  .model('user')
    .attr('name')
    .attr('firstName').from('first_name')
    .attr('middleName').from('middle_name')
    .attr('lastName').from('last_name')
    .attr('gender')
      .validate('in', [ 'female', 'male' ])
    .attr('link')
      .validate('isUrl')
    .attr('username');
```

Specify (optional) how to serialize data types from JavaScript to the database-/service-specific format:

```js
adapter('mongodb')
  .type('string', fn)
  .type('text', fn)
  .type('date', fn)
  .type('float', fn)
  .type('integer', fn)
  .type('number', fn)
  .type('boolean', fn)
  .type('bitmask', fn)
  .type('array', fn);
```

<!--
## Program

```js
var program = require('tower-query');
```

## Topology

```js
var topology = require('tower-topology');
```
-->

## Template

Client-side reactive templates (just plain DOM node manipulation, no strings).

```js
var template = require('tower-template');

var el = document.querySelector('#todos');
var fn = template(el);
fn({ some: 'data' }); // applies content to DOM directives.
```

## Directive

API to the DOM. Tells the DOM what to do.

```js
var directive = require('tower-directive');

directive('data-text', function(scope, element, attr){
  element.textContent = scope[attr.value];
});

var content = { foo: 'Hello World' };
var element = document.querySelector('#example');

directive('data-text').exec(content, element);
```

example template:

```html
<span id="example" data-text="foo"></span>
```

becomes:

```html
<span id="example" data-text="foo">Hello World</span>
```

The directives are used more robustly in [tower-template](https://github.com/tower/template).

## Content

Data for the DOM.

```js
var content = require('tower-content');

content('menu')
  .attr('items', 'array')
  .attr('selected', 'object')
  .action('select', function(index){
    this.selected = this.items[index];
  });

content('menu').init({ items: [ 'a', 'b' ] }).select(1);
```

## Expression

API for creating custom parsers (based on parsing expression grammars, [PEGs](http://en.wikipedia.org/wiki/Parsing_expression_grammar)).

This is a basic math example inspired from [pegjs](http://pegjs.majda.cz/online).

```js
var expression = require('tower-expression');

expression('additive')
  .match(':multiplicative', ' + ', ':additive', function(left, op, right){
    return left + right;
  })
  .match(':multiplicative');

expression('multiplicative')
  .match(':primary', ' * ', ':multiplicative', function(left, op, right){
    return left * right;
  })
  .match(':primary');

expression('primary')
  .match(':integer')
  .match('(', ':additive', ')', function(l, additive, r){
    return additive;
  });

expression('integer')
  .match(/[0-9]+/, function(digits){
    return parseInt(digits, 10);
  });

var integer = expression('additive').parse('(7 + 8) * 2');
console.log(integer); // 15
```

One place expressions are used is in directives, for parsing statments, such as:

```html
<li data-each="user in users">{{user.username}}</li>
<div data-text="loggedIn ? 'Profile' : 'Log in"></div>
```

There are many applications for expressions, such as custom search input expressions (like google/twitter have), custom macros, building fast client-side syntax highlighters, etc.

## Route

Tiny route component for client and server.

```js
var route = require('tower-route');

route('/welcome', function(context, next){
  context.render({ title: 'Hello World' });
});
```

Or with the `action` method:

```js
route('/welcome')
  .action(function(context, next){
    context.render({ title: 'Hello World' });
  });
```

You can also name them (makes it so you don't have to mess with url strings in code, to redirect/transition/etc.:

```js
route('new-customer', '/welcome');
```

## Router

```js
var router = require('tower-router');

router.start();
```

## Type

API for defining/sanitizing custom resource attribute types.

```js
var type = require('tower-type');
```

Define comparators/validators for basic types:

```js
type('string')
  .validator('gte', function gte(a, b){
    return a.length >= b.length;
  })
  .validator('gt', function gt(a, b){
    return a.length > b.length;
  });
```

Define a custom type with custom validators:

```js
var now = Date.parse('2013-05-01');

type('birthdate')
  .validator('can-drive', function(val){
    return now >= val;
  });

var validate = type.validator('birthdate.can-drive');
validate(Date.parse('1950-12-21')); // true
```

Sanitize values:

```js
type('digits')
  .use(stripWhitespace)
  .use(stripLetters);

type('digits').sanitize('  1  foo b2a3r'); // 123

function stripWhitespace(val) {
  return val.replace(/\s+/g, '');
}

function stripLetters(val) {
  return val.replace(/[a-z]+/g, '');
}
```

## Validator

Minimal, extensible validation component.

```js
var validator = require('tower-validator');

validator('eq', function eq(a, b){
  return a === b;
});

validator('neq', function neq(a, b){
  return a !== b;
});

validator('gte', function gte(a, b){
  return a >= b;
});

validator('gt', function gte(a, b){
  return a > b;
});
```

## Text

I18n, inflections, and other random bits of text to keep organized.

```js
var text = require('tower-text');

text('messages')
  .one('You have 1 message')
    .past('You had 1 message')
    .future('You might get a message')
  .none('You have no messages')
    .past('You never had any messages')
    .future('You might never get a message')
  .other('You have {{count}} messages')
    .past('You had {{count}} messages')
    .future('You might get {{count}} messages');

assert(9 === text('messages').inflections.length);

// 1
assert('You have 1 message' === text('messages').render({ count: 1 }));
assert('You had 1 message' === text('messages').render({ tense: 'past', count: 1 }));
assert('You might get a message' === text('messages').render({ tense: 'future', count: 1 }));

// 0
assert('You have no messages' === text('messages').render({ count: 0 }));
assert('You never had any messages' === text('messages').render({ tense: 'past', count: 0 }));
assert('You might never get a message' === text('messages').render({ tense: 'future', count: 0 }));

// n
assert('You have 3 messages' === text('messages').render({ count: 3 }));
assert('You had 3 messages' === text('messages').render({ tense: 'past', count: 3 }));
assert('You might get 3 messages' === text('messages').render({ tense: 'future', count: 3 }));
```

## Cookbook

```bash
$ tower create ec2:server
```