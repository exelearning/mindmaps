/*
 * Regression cover for the translation hooks.
 *
 * eXeLearning embeds mindmaps and translates its interface by installing a
 * global translator before this application loads. Those hooks were once lost:
 * only a generated bundle survived, and nothing could rebuild it. These checks
 * keep the mechanism from disappearing again, and keep standalone mindmaps
 * working when no translator is present.
 *
 *   node test/i18n-hooks.test.js
 *
 * Deliberately plain Node with no dependency: the browser specs under
 * test/jasmine need a browser, and this has to be runnable while building.
 */
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var srcDir = path.join(__dirname, "..", "src", "js");
var distBundle = path.join(__dirname, "..", "dist", "js", "script.js");
var passed = 0;

function test(name, fn) {
  fn();
  passed++;
  console.log("ok - " + name);
}

function read(file) {
  return fs.readFileSync(path.join(srcDir, file), "utf8");
}

/**
 * Loads the given sources into a fresh sandbox that looks enough like a browser
 * for the files under test, optionally with a translator already installed.
 */
function load(files, installHost) {
  var sandbox = {};
  sandbox.window = sandbox;
  sandbox.console = { log: function() {}, debug: function() {}, error: function() {} };
  // MindMaps.js registers two jQuery ready handlers at load time.
  sandbox.$ = function() { return { ready: function() {} }; };
  sandbox.$.event = { props: [] };
  sandbox.navigator = { userAgent: "node" };

  if (installHost) {
    sandbox._ = function(s) { return "T:" + s; };
    sandbox._r = function(s) { return "R:" + s; };
  }

  var context = vm.createContext(sandbox);
  files.forEach(function(file) {
    vm.runInContext(read(file), context, { filename: file });
  });
  return sandbox;
}

// 1. Standalone mindmaps must keep working with no translator at all.
test("without a host translator both hooks fall back to the identity function", function() {
  var app = load(["MindMaps.js"]);

  assert.strictEqual(typeof app._, "function");
  assert.strictEqual(typeof app._r, "function");
  assert.strictEqual(app._("Open"), "Open");
  assert.strictEqual(app._r("A longer sentence."), "A longer sentence.");
});

// 2. A host translator must win: the fallback may never overwrite it.
test("a translator installed by the host is left alone", function() {
  var app = load(["MindMaps.js"], true);

  assert.strictEqual(app._("Open"), "T:Open");
  assert.strictEqual(app._r("Help"), "R:Help");
});

// 3. The strings really do travel through the translator.
test("command labels are translated when a translator is installed", function() {
  var app = load(["libs/events.js", "MindMaps.js", "Command.js"], true);

  assert.strictEqual(new app.mindmaps.CreateNodeCommand().label, "T:Add");
  assert.strictEqual(new app.mindmaps.UndoCommand().label, "T:Undo");
});

// 4. With the identity fallback the interface is the plain English it always was.
test("command labels are unchanged English without a translator", function() {
  var app = load(["libs/events.js", "MindMaps.js", "Command.js"]);

  assert.strictEqual(new app.mindmaps.CreateNodeCommand().label, "Add");
  assert.strictEqual(new app.mindmaps.UndoCommand().label, "Undo");
  assert.strictEqual(new app.mindmaps.HelpCommand().label, "Help");
});

// 5. Anchor a few call sites, so an upstream merge that drops them is loud.
test("representative strings are wrapped in source", function() {
  assert.ok(/_\("Central Idea"\)/.test(read("MindMap.js")), "MindMap.js root caption");
  assert.ok(/_\("Add"\)/.test(read("Command.js")), "Command.js labels");
  assert.ok(/_\("Mind map"\)/.test(read("ToolBar.js")), "ToolBar.js file menu");
  assert.ok(/_\("Inspector"\)/.test(read("MainViewController.js")), "MainViewController.js panels");
  assert.ok(/_r\(/.test(read("HelpController.js")), "HelpController.js help text");
});

// 6. The status bar and the production console alert translate too.
test("status bar notifications and the console alert are translated", function() {
  assert.ok(/_\("Mind map saved"\)/.test(read("StatusBar.js")), "StatusBar.js save notice");
  assert.ok(/_\("Warning"\)/.test(read("StatusBar.js")), "StatusBar.js warning title");
  assert.ok(/_\("Error"\)/.test(read("StatusBar.js")), "StatusBar.js error title");
  assert.ok(/window\.alert\(_\("Error"\)/.test(read("MindMaps.js")), "MindMaps.js console alert");
});

// 7. The hooks have to survive minification, which is what actually ships.
test("the built bundle keeps the hooks and the fallback", function() {
  if (!fs.existsSync(distBundle)) {
    console.log("  (skipped: run `npm run build` first)");
    return;
  }
  var bundle = fs.readFileSync(distBundle, "utf8");

  assert.ok(bundle.indexOf('_("Add")') !== -1, "short hooks survive minification");
  assert.ok(/_r\(/.test(bundle), "rich hooks survive minification");
  // uglify rewrites the guard to '"function"!=typeof window._', so match the
  // parts that cannot be reordered away rather than the source spelling.
  assert.ok(bundle.indexOf("typeof window._r") !== -1, "rich fallback survives minification");
  assert.ok(/window\._\s*=\s*function/.test(bundle), "short fallback survives minification");
});

console.log("\n" + passed + " passed");
