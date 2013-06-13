# Resources

A resource is a piece of data. It's like a model in traditional web MVC's, but it is more general than that. Resources can be:

- database records
- remote API JSON responses, 
- files on the file system
- config JSON
- UI data such as x/y position
- etc.

You may wonder why a resource is this abstract, why not just be like an MVC model?

The reason is the way we've used models in the past (ActiveRecord in Rails for example) is just a piece of the system. It is only part of the solution. Traditional models are incomplete. If you look into the code for great libraries such as [fog](https://github.com/fog/fog) and [chef](https://github.com/opscode/chef), you realize that they are using models as well, but in a totally different way. They ended up reimplementing a version of ActiveRecord in new context (remote API resources for Fog, and install packages and other operating system config/data for Chef).

This has powerful implications. If you unify all of those different use cases, you gain the ability to query anything, anywhere, using a standard API across all the different areas.

What this means is astounding. You have one simple abstraction over _all_ data.

You can transfer your knowledge of data models to completely new areas.