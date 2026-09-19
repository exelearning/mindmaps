# Replacing jquery.tmpl — scope note

`jquery.tmpl` was abandoned in 2011 while still labelled `1.0.0pre`. It works on jQuery
3.7.1 and everything built with it is covered by browser tests, so there is no urgency.
This note exists so that replacing it can be decided on evidence rather than estimated
from scratch later.

**It is not a dependency bump.** The implementation is bundled by this repository; the
templates it renders live in eXeLearning, in
`public/libs/tinymce_5/js/tinymce/plugins/exemindmap/editor/index.html`. Replacing it
means changing both repositories together, and the fork cannot do it alone.

## Call sites

Eight, all of the form `$("#template-x").tmpl(data)`:

| File | Template | Data |
|---|---|---|
| `FloatPanel.js` | `#template-float-panel` | `{ title }` |
| `Inspector.js` | `#template-inspector` | none |
| `Navigator.js` | `#template-navigator` | none |
| `Notification.js` | `#template-notification` | the notification options |
| `ExportMap.js` | `#template-export-map` | none |
| `SaveDocument.js` | `#template-save` | none |
| `OpenDocument.js` | `#template-open` | none |
| `OpenDocument.js` | `#template-open-table-item` | an array of documents, plus `$item.format` |

Four of the eight render a template with no data at all — those are static markup in a
`<script>` tag and need no template engine whatsoever.

## Templates

Seven, all in eXeLearning's `editor/index.html`:

```
template-float-panel   template-inspector   template-navigator   template-notification
template-open          template-open-table-item                  template-save
```

`#template-export-map` is referenced by `ExportMap.js` but is **not** among them: that
command is not wired into eXeLearning's toolbar, so the call site is unreachable there.
Worth confirming before relying on it.

## Syntax actually used

Far less than the library offers:

| Feature | Uses | Replacement |
|---|---|---|
| `${...}` | 13 | ordinary interpolation |
| `{{if}}` | 2 | a conditional |
| `{{html}}` | 2 | assignment to `innerHTML`, with the same escaping question as today |

No `{{each}}`, `{{tmpl}}`, `{{wrap}}`, or nested templates. `$item.format` appears once,
in the open-dialog table row, and is a formatting helper passed as an option.

## Could native APIs replace it?

Yes, in principle. `<template>` plus `cloneNode` covers the static four outright. The
three that take data need interpolation — either a small helper (a `${...}` replacer
over a data object is a few lines) or converting those templates to `<template>` markup
whose fields are filled by direct DOM assignment, which is what the values are used for
anyway.

The honest catch is not the engine, it is the boundary. The templates are eXeLearning's
file and the renderer is this repository's bundle, so any replacement lands as a
coordinated pair of changes with a version of each in flight at once — and the vendored
bundle is pinned by hash, so the two must be merged in a known order.

## Scope and tests

Small in code, awkward in coordination: roughly a day, most of it verification rather
than typing.

The existing browser tests already assert that the panels and dialogs render with
substituted text and no leftover `${` placeholder, which is the contract a replacement
has to meet. What they do not yet cover is `#template-open-table-item` — the only
template that renders a list, uses `$item`, and is therefore the one most likely to
behave differently. **Cover that first**; it is the piece that would otherwise be
verified by hand.
