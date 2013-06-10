# Elements

Once you start building more complex templates which have custom JavaScript, and maybe some configuration (like paginators, modal windows, form fields, etc.), custom [elements](https://github.com/tower/element) are perfect for this.

In Tower, an "element" is _a template + some JavaScript_. That's it. So take a paginator for example. Rather than calling it a "paginator view" or something that has a "pagination controller", just think of creating a "paginator" which is just some HTML with a JavaScript API. Here's how that might look:

## The Element's HTML Template

**template** (the HTML is straight from the Twitter Bootstrap [pager component](http://twitter.github.io/bootstrap/components.html#pagination)):

```html
<ul class="pager">
  <li><a href="#" on-click="prev()">Prev</a></li>
  <li><a href="#" on-click="next()">Next</a></li>
</ul>
```

So in there we just added the standard [event directive](https://github.com/tower/event-directive) `on-click`, which executes a function (`prev()` or `next()`). Now we just need to define those functions. In Tower we call these functions "actions", since most of the time, from the DOM's perspective, when you execute a function it's in response to some thing the user did, so you can think about it as "a user performing an action" (also, `action` is used all throughout the core modules, so it makes having a super consistent and simpler API). In addition to these "actions", you can also define "attributes" (such as configuration, or maybe to allow customizing the `Prev` and `Next` labels), but for this simple case we'll just focus on actions.

An element, like a template, gets its actions and attributes from [content](https://github.com/tower/content). In the DOM there is (by convention) a root/global content object, and then you can create new nested content objects (more on this in the [content](/guides/content) section). When you create nested content like this, it's called creating a new "content scope", similar to how in JavaScript, each function creates a new "scope".

Why is this relevant for an element?

Elements create a new content scope automatically for you, so you just need to know that when you define actions and attributes on your custom `element`, all that's actually happening is those methods are being delegated to a `content` object specific to that element. You can see that [in the source code](https://github.com/tower/element/blob/e5a301fa63d3a04f1abc5952143cd883a08d2434/lib/statics.js#L42-L50).

## The Element's JavaScript

Here's how we'd define the paginator element that works with the above HTML template:

```js
var element = require('tower-element');
var html = require('./template'); // the template HTML from above

element('paginator')
  .template(html)
  .action('prev', function(paginator){
    // do something to the paginator, paginator.el, or paginator.content
  })
  .action('next', function(paginator){

  });
```

Then we can instantiate the paginator like this:

```js
var paginator = element('paginator').init();
var el = paginator.render();
```

The actual DOM node is stored on the element instance as well (after `.render()` has been called):

```js
paginator.el
```

## Using Attributes on Elements

Now what if we want to be able to specify the label for `Prev` and `Next`?

Easy!

We just need to make the hardcoded strings in the template into variables (like mustache/handlebars), and add those attributes to the `element('paginator')` DSL (and you can set default values too):

```html
<ul class="pager">
  <li><a href="#" on-click="prev()">{{prevLabel}}</a></li>
  <li><a href="#" on-click="next()">{{nextLabel}}</a></li>
</ul>
```

```js
element('paginator')
  .template(html)
  .attr('prevLabel', 'string', 'Prev')
  .attr('nextLabel', 'string', 'Next')
  .action('prev', function(paginator){
    
  })
  .action('next', function(paginator){

  });
```

So now if you instantiated and rendered your paginator, it would be rendered like it was before. But you can also customize the labels this time:

```js
var paginator = element('paginator').init();
document.body.addChild(paginator.render({ prevLabel: '<', nextLabel: '>' }));
```

## Building hardcore UI elements

Ideally, this element API will allow for creating super robust/complex UI elements, such as forms, [datagrids](https://github.com/mleibman/SlickGrid) and things like Pinterest's scroller (Airbnb open sourced [infinity](https://github.com/airbnb/infinity) which is similar).

However, if you do end up creating a complex UI component like these, I recommend not building all of the logic into the `element` DSL. Instead, try to build it so it can be used independently of Tower, but then you can wrap it in a Tower `element` and release that repo too, so your component can easily hook into Tower's templating system.

This also goes to show, it should be easy to integrate any external UI thingy into Tower so it can be used with this standard API.

Last little note. I'd say that most of the time you won't need to build custom elements, and can instead just use plain HTML templates and the built in directives. But if the time comes where that's not enough, this is here to make the enhancement easy.