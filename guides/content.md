# Content

Data for the DOM.

When you describe the UI, you talk about the design and the content. Wikipedia says that content (media content) is basically the data that gets shown to the end user. So that's what this content is, the data that gets shown to the user.

Most frameworks allow you to bind arbitrary data to the DOM. Angular allows you to bind any plain-old JavaScript object. Ember requires you use their own objects, all of which are observable. Knockout makes you wrap your object to be "observable". In the end, they all do this sort of thing because all browsers doesn't yet support listening for property changes in a reliable way.

But if you really think about it, you don't need to bind plain-old JavaScript objects to the DOM. Nor do _all_ the objects in the framework need to be observable. What you need is a clear way to show the user _content_, arbitrary data that is specifically meant for the DOM.

That is, you need an API to take arbitrary data (whether it's your model, some random config properties, hardcoded menu items, the result from a remote API call, whatever), and say "expose this to the DOM". Here's how you do that:

```js
var content = require('tower-content');

content('main')
  .attr('random', 'string', 'config!')
  .attr('items', 'array', [ 'Home', 'About' ]);
```

Then you tell the DOM how to find that content:

```html
<body data-content="main">
  ...
</body>
```

That's it! You can put any arbitrary data into content attributes.

Now why is this preferrable to the other frameworks approaches? Two big reasons:

1. You don't have to add a bunch of heavy-weight code to all of your framework objects for handling observing. Which means the rest of your code is just using plain JavaScript objects. Which means your code is super fast (and lightweight).
2. You're being explicit about the content the user sees. By being explicit, you can clearly see where the data in your app interfaces with the DOM, so you'll know where to look for rendering performance issues immediately, without having to learn how the entire framework mananges their observer behavior.

### The parts of `content`

The `content` API has 2 methods:

- `attr` for defining attributes and default values.
- `action` for defining functions that should execute when a user clicks or performs some action.

So you define `attr` for every property you want to expose to the DOM, and `action` for every function you want to run when the user does something. That's it!

You might wonder if that's really all you need (`attr` and `action`), "what about arbitrary functions" or "what about this one case"? You might be right, there may be a few more cases to cover (though I doubt it). But so far based on using this it doesn't seem like you'll need anything more that this. We'll have to all figure out the exact best way as we go, but for now this is a super lean and super simple approach, and seems to cover pretty much every use case in practice.

Most use cases are covered because, other than binding data to the DOM, you want to "do stuff" when the user clicks something (emits and event). So the bulk of your code is actually in those event handlers (call them "actions"), which are independent.