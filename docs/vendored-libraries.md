# Vendored libraries

mindmaps predates package managers for browser code, so its dependencies are files in
the repository rather than entries in `package.json`. This records what each one is,
where it came from, and — for the ones that are no longer maintained anywhere — why it
is still here rather than replaced.

Being old is not by itself a reason to replace a library. A vendored file that works,
has a known provenance and is covered by tests is a smaller risk than a migration
nobody asked for. The entries below are split on that basis.

## Host-provided

Loaded by the page and deliberately **not** concatenated into the bundle, so an
application embedding mindmaps supplies its own. They live in `src/js/vendor/` because
the build does not copy `src/js/libs/` into `dist` — everything there is already inside
the bundle.

| Library | Version | Licence | Notes |
|---|---|---|---|
| jQuery | 3.7.1 | MIT | Byte-identical to `jquery@3.7.1` on npm and to the copy eXeLearning ships |
| jQuery UI | 1.14.1 | MIT | Byte-identical to `jquery-ui@1.14.1` on npm and to eXeLearning's copy |
| FileSaver.js | 2.0.5 | MIT | Consumed by `SaveDocument.js` via `window.saveAs` |

## Maintained upstream, vendored here

Still released, tracked by version, updated as part of normal maintenance.

| Library | Version | Licence | Provenance |
|---|---|---|---|
| jquery.mousewheel | 3.2.2 | MIT | `jquery/jquery-mousewheel` tag `3.2.2`; npm tarball and git tag compared and identical |
| jquery.minicolors | 2.3.6 | MIT | `@claviska/jquery-minicolors@2.3.6` — the scoped package; the unscoped one is stale and not the author's |

## Retained legacy code

No maintained upstream to move to. Kept as vendored source with explicit provenance,
not pretended to be a current dependency.

### jquery.hotkeys 0.8

*John Resig, dual MIT/GPL, based on work by Tzury Bar Yochay.*

**Used once.** `ShortcutController.js` passes a shortcut string as `bind()`'s event
data:

```js
$(document).bind(type, shortcut, function(e) { ... });
```

The plugin reads that string, matches modifiers against the key event, and declines to
fire while a `textarea`, `select` or text input has focus — which is what keeps typing
a caption from triggering the delete command.

**Retained because it works.** It runs correctly on jQuery 3.7.1 and the browser tests
cover both halves of its contract: `ctrl+z` undoes exactly once, and a shortcut key
typed into a caption does not fire the command. Replacing a working 80-line file that
is covered by tests, purely because it is old, would trade a known quantity for an
unknown one. If it is ever replaced, `KeyboardEvent.key` plus a small matcher would do
the job — but that is a change to make deliberately, with those tests as the contract.

### dragscrollable 1.0

*Miquel Herrera (2009), dual MIT/GPL — **with a local modification**.*

**Used once**, in `CanvasView.js`, to pan the canvas by dragging its background.

**This is not an upgradable dependency.** There has been no upstream release since
2009, and the copy here is not upstream's: David Richard added a `delegateMode` option
in 2011 so the handler can be attached by delegation rather than bound directly. Any
"update" would mean taking a different project and reapplying that change.

Treat it as maintained application source that happens to carry a third-party licence
header. The panning behaviour is covered by a browser test.

### Aristo-derived stylesheet

*Derived from the Aristo jQuery UI theme, itself built for jQuery UI 1.8.7.*

**This is the editor's appearance**, not a drop-in theme that can be swapped for a
current one. It is maintained application CSS: `app.css` carries the rules that adapt
it to jQuery UI 1.14 markup — laying controlgroups out inline where buttonsets used to
be, and supplying the `.ui-front` stacking rule the theme predates, without which modal
dialogs sit underneath their own overlay.

Replacing it belongs to a visual redesign with screenshot coverage, not to dependency
maintenance.

### jquery.tmpl 1.0.0pre

*Software Freedom Conservancy, MIT. Abandoned in 2011 while still in beta.*

Retained, but unlike the others this one is a genuine architectural question rather
than a judgement call. See [jquery-tmpl-replacement.md](jquery-tmpl-replacement.md).
