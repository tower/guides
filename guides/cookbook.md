# Cookbooks

The idea of cookbooks came out of a desire to use Chef, the great automation library for Ruby, in JavaScript. So every layer in your app -- the client, the server, and also the command line -- is just plain JavaScript.

Cookbooks are an extensible system for abstracting away common tasks and commands. This includes components such as:

- generators
- build scripts (like things you would do with Grunt/Yeoman)
- making an [adapter](/guides/adapters) useable from the command line (see [tower-ec2-cookbook](https://github.com/tower/ec2-cookbook))
- abstracting away install scripts (such as installing node.js, git, or mongodb on EC2, like Chef cookbooks)
- building aliases to commands (such as simplifying the API for ssh-ing to a remote server, or normalizing how you enter a database console)

Cookbooks are super easy to write. It's just one `index.js` that `exports` "actions" (such as `create`, `remove`, `install`, etc.). Because of Tower's [CLI abstraction](/guides/cli), you can execute these cookbook actions ("recipes") from the command automatically. Super powerful.

## How a cookbook works

One of the simplest cookbooks is just a generator (like one you find in Rails). Here is the [tower-component-cookbook](https://github.com/tower/component-cookbook), which generates a new module (with `package.json` for npm and `component.json`) with this commmand:

```bash
$ tower create component my-component
```

Here's what happens when we execute that command:

1. Goes to [tower-cli](https://github.com/tower/cli) (since it is just using the `tower` executable), and figures out that you called the action `create` on the cookbook `component`.
2. Finds the cookbook `component`.
3. Calls the method `create` on the cookbook `component`, passing in a new [recipe](https://github.com/tower/recipe) object (which just has some helpful methods like you'd find in a generator), and the command line arguments.
4. The action `create` then can parse the arguments (using any one of the many cli option parsers for node, it's agnostic), and do whatever it needs to, in this case, generating a JavaScript module.

This is the structure of a cookbook action:

```js
exports.create = function(recipe, args, fn){
  // fn (callback) is an optional third param
};
```

You have full control over how the arguments are parsed and what happens. Here is an example of parsing arguments with [commander](https://github.com/visionmedia/commander.js/):

```js
exports.create = function(recipe, args, fn){
  var projectName = args[4];

  var options = require('commander')
    .option('-o, --output-directory [value]', 'Output directory', process.cwd())
    .option('-b --bin [value]', 'include executable', false)
    .option('--component [value]', 'Add component.json', false)
    .option('--package [value]', 'Add package.json', true)
    .option('--travis [value]', 'Add travis.yml', false)
    .option('--namespace [value]', 'Namespace for component')
    .parse(args);

  // ...
};
```

Take a look at the [component-cookbook source](https://github.com/tower/component-cookbook/blob/master/index.js) for the robust implementation.