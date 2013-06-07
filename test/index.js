var towerGuides = 'undefined' == typeof window
  ? require('..')
  : require('tower-guides'); // how to do this better?

var assert = require('assert');

describe('towerGuides', function(){
  it('should test', function(){
    assert.equal(1 + 1, 2);
  });
});
