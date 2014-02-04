# Expressions

Expressions allow you to put data bindings on html tag elements to simplify rendering complicated data in your templates.

Let's get started with a simple example:

```html
<div data-text=""></div>
```

That's cool, right? Well, it's just an empty text binding, nothing to it. So let's add a binding to a simple attribute:

```html
<div data-text="user"></div>
```

For example if `user` has the value of `Slim Jim`, this would render:

```html
<div data-text="user">Slim Jim</div>
```

This example is a string expression.

Let's get into a more complicated example:

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

# Expression Engine

Within Tower, sits an incredibly powerful expression engine that powers every binding. We felt like we could create an expressive language that sits in element attributes.

The expression engine is hand-built. Well, you'll probably say "Yeah, sure, just like anything else that's programmed. All by hand".
No, no, no. When I say "by-hand", I mean in relation to the components of an expression engine: a Lexer and Parser, and anything else related to the expression engine.
We don't use some sort of magical generator that produces extremely huge Lexers, Parsers, and whatever else they have.
The expression engine is small, modular, and fast.
Even better, this has no dependencies on the DOM, which means it can be used client-side and server-side.

Let's get a better picture on how Tower's expression engine works.

The expression engine has the following stages:

```
Input -> Lexer -> Parser -> Search
```

`tower-expression/index.js` exposes an `expression` function and accepts a string: an expression. It'll handle the big work of lexing and parsing the string.

We've made an extensible Lexer that's not specific to the expression system.

```js
var lex = new Lexer()
  .def('token1', /^\[$/)
  .string('random string to lex')
  .start();
```