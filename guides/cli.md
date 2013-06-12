# Tower's Command Line Interface (CLI)

```bash
$ tower <action> <object> [options]
```

Tower's command line was built to be super fast. When you enter the tower console, it's instant (on the order of 10ms):

```bash
$ tower console
```

Another big goal of the CLI was to make it infinitely extensible (but avoiding the problem of people swooping on names and whatnot). To do this, we standardized the structure of command line arguments:

```bash
$ tower <action> <object> [options]
```

You can create your own commands by creating a cookbook (see the [cookbook](/cookbooks) section).