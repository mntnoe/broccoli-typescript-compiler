'use strict';

var fs = require('fs');
var loadTSConfig = require('../lib/load-ts-config');
var expect = require('chai').expect;

describe('loadTSConfig', function() {

  it('throws on invalid input', function() {
    expect(loadTSConfig).to.throw(/to be a string/);
    expect(function() {
      loadTSConfig(undefined);
    }).to.throw(/to be a string/);

    expect(function() {
      loadTSConfig(null);
    }).to.throw(/to be a string/);
  });

  it('throws for missing file', function() {
    expect(function() {
      loadTSConfig('nothing/here');
    }).to.throw(/no such file or directory/);

    expect(function() {
      loadTSConfig('nothing/here');
    }).to.throw(/Cannot load tsconfig.json from/);
  });

  it('throws for empty file', function() {
    var from = __dirname + '/fixtures/empty-ts-config.js';
    expect(function() {
      loadTSConfig(from);
    }).to.throw('Cannot load tsconfig.json from: `' + from + '`\ntsconfig file cannot be empty');
  });

  it('throws for malformed file', function() {
    var from = __dirname + '/fixtures/malformed-ts-config.js';

    expect(function() {
      loadTSConfig(from);
    }).to.throw('Cannot load tsconfig.json from: `' + from + '`\nFailed to parse file \'' + from + '\': Unexpected end of input.');
  });

  it('loads blank', function() {
    expect(loadTSConfig(__dirname + '/fixtures/basic-ts-config.js')).to.deep.eql({
      noEmit: false
    });
  });

  it('loads advanced', function() {
    expect(loadTSConfig(__dirname + '/fixtures/more-advanced-ts-config.js')).to.deep.eql({
      inlineSourceMap: true,
      inlineSources: true,
      mapRoot: __dirname + '/fixtures/packages',
      moduleResolution: 2,
      noEmit: false,
      rootDir: __dirname + '/fixtures/packages',
      target: 2
    });
  });
});
