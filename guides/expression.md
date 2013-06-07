# Expression Engine

Within Tower, sits an increadibly powerful expression engine that powers every binding. We felt like we could create an expressive language that sits in element attributes.

Let's get started with a simple example:

```html
<div data-text=""></div>
```

That's cool, right? Well, it's just an empty text binding, nothing to it. So let's add a binding to a simple attribute.

```html
<div data-text="user"></div>
```

This would effectively render the following, if `user` would equal to `HelloWorld`

```html
<div data-text="user">HelloWorld</div>
```

This short example just showed you a simple expression; a string expression. Expressions do get more complicated than that, but the premise stays the same.

The expression engine is hand-built. Well, you'll probably say "Yeah, sure, just like anything else that's programmed. All by hand". No, no, no. When I say "by-hand", I mean in relation to the Lexer and Parser, and anything else related to the expression engine. We don't use some sort of magical generator that produces extremely huge Lexers, Parsers, and whatever else they have.
The expression engine is small, soon-to-be modular, and fast. This makes it viable to run on the client-side, as well as the server. Oh, yes, this has no dependencies on the DOM, which means it can be used server-side.

Let's get into a more complicated example, shall we?

```html
<div data-list="user in users [buffer: 2, max: 10]"></div>
```

Wow. What's that?

That's a "foreach" or "each" expression, with arguments. In this case, we want to create an additional 2 element buffer in our list, and only have a maximum of 10 elements. Super simple and concise.

The string "user in users" is probably familiar. Many languages and some frameworks have this syntax, or something similar.

Want more?

```html
<div data-list="user in users [buffer: 2, max: 10] | filter: startsWith(a) | sort: reverse()"></div>
```

