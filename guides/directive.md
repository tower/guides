# Directives

Directives are the API to the DOM. In a perfect world, they're the only place your app code touches the DOM.

```html

```

One developer called them [domain-specific extensions to HTML](http://henriquat.re/directives/introduction-to-directives/introductionToDirectives.html).

## Creating a custom directive

You know how those old-school websites sometimes have events posted where the event expired like 3 weeks ago, but it's still says "Come to our event this saturday!"? I feel bad because you know it's going to take them a bunch of time calling and emailing people to "update their site" to remove that event.

Never again.

Here is how you can solve that with directives and never have to worry about stuff like that in the future: automatically remove the event when the event passes.

```html
<div data-expires="june 30, 2013">
  Come to our BBQ on Sunday, June 30th!
</div>
```

So we just added an attribute to the DOM that we just made up, `data-expires`. Now we need to define a directive for it:

```js
var directive = require('tower-directive');

directive('data-expires', function(scope, el, attr){
  var date = new Date(attr.value);
  var now = new Date;

  // if today is on or past the day, remove the element
  if (date <= now) $(el).remove();
});
```

It is as simple as that. Now when that DOM node is encountered, and the directives are parsed for it (this stuff all happens when you run a DOM node through a template), it will execute that directive, passing in the `scope` (the current `tower-content` instance which has a bunch of properties and methods on it), the actual DOM element `el`, and `attr` which has the value that the element attribute was set to, parsed using `tower-expression`. All you really need to know is that in this directive function, you get the element that had that directive on it, and some data you can use (or ignore) to manipulate the element.

## Resources

- http://www.bennadel.com/blog/2440-Creating-A-Custom-Show-Hide-Directive-In-AngularJS.htm
- http://docs.angularjs.org/guide/directive
- http://blog.brunoscopelliti.com/use-cases-of-angularjs-directives
- http://henriquat.re/directives/advanced-directives-combining-angular-with-existing-components-and-jquery/angularAndJquery.html
- http://henriquat.re/directives/introduction-to-directives/introductionToDirectives.html#transclusion