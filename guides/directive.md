# Directives

Directives are the API to the DOM. In a perfect world, they're the only place your app code touches the DOM.

```html

```

One developer called them [domain-specific extensions to HTML](http://henriquat.re/directives/introduction-to-directives/introductionToDirectives.html).

## Creating a custom directive

You know how those old-school websites sometimes have events posted where the event expired like 3 weeks ago, but it's still says "Come to our event this saturday!"? I feel bad because you know it's going to take them a bunch of time calling and emailing people to "update their site" to remove that event.

Never again.

Here's how you can solve that with directives and never have to worry about stuff like that in the future: automatically remove the event when the event passes.

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

It's as simple as that.

## Resources

- http://www.bennadel.com/blog/2440-Creating-A-Custom-Show-Hide-Directive-In-AngularJS.htm
- http://docs.angularjs.org/guide/directive
- http://blog.brunoscopelliti.com/use-cases-of-angularjs-directives
- http://henriquat.re/directives/advanced-directives-combining-angular-with-existing-components-and-jquery/angularAndJquery.html
- http://henriquat.re/directives/introduction-to-directives/introductionToDirectives.html#transclusion