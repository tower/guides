# Templates

Tower's template component is built in response to the 100's of other template engines that fall short in one or more key areas:

- performance
- extensibility
- overall file size of the implementation
- simplicity
- client/server compatability

All an HTML template engine needs to do is map data to the DOM.

At the lowest level, this is how it's used:

```js
var template = require('tower-template');
var el = document.querySelector('#todos');
var fn = template(el);
fn({ some: 'data' });
```

A template function `fn` is built by passing a DOM node to `template`.

```js
var fn = template(el);
```

With that function you can do two things:

1. You can apply new content to it, which will update the `el` you passed in to build the template.
2. Or you can call `fn.clone(content)`, which will clone the original `el`, and apply the new content to it. This is useful for creating new list items, for example.

### Template Compiler Deep Dive

The template compilation process is super simple. This is the process at a high level:

```js
templateFn(scope);
  nodeFn(scope, node); // node is the cached item from building the template, so `document.body`
    scope = directivesFn(scope, node); // process directives for this node, returns new/old scope
      scope = scopeFn(scope); // find the correct scope for this node, from its directives
    eachFn(scope, node.childNodes);
      nodeFn(scope, childNode); // recurse, where `scope` might be a new one from above
```

So, for each node, it first processes the directives (`directive.exec`), and each `directive.exec` returns either the current scope or a new scope. The end result of processing directives is a `scope` (new or original), that then will be used to process child nodes. So then it iterates through the child nodes, and repeats the whole process.

This way, when you execute the template function with a scope:

```js
var template = require('tower-template');
var fn = template(el);
fn(scope);
```

it basically just iterates through a bunch of functions, passing scopes to directives which then apply the scope data to the DOM.

## Examples

### Nav

```html
<ul class="nav nav-tabs">
  <li data-list="item in nav" data-class="active">
    <a href="#"></a>
  </li>
</ul>
```