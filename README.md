# PSA: This project is not actively maintained. I consider it feature complete for what it set out to do. I'll fix critical bugs should they pop up but I won't be adding new features.


## eXeLearning maintenance fork

This repository is a conservative maintenance fork of
[drichard/mindmaps](https://github.com/drichard/mindmaps), maintained by the
[eXeLearning](https://github.com/exelearning) project. The application, its
architecture and its design are the work of David Richard and the original
contributors; this fork claims no authorship over them.

As stated above, the original author considers mindmaps feature-complete and
intentionally does not pursue modernization. eXeLearning embeds mindmaps in its
editor, so we keep this fork as a place to carry out the maintenance our own
distribution requires: dependency updates, findings reported by security
tooling, browser compatibility, and fixes needed for its continued use inside
eXeLearning.

Our intention is to preserve the existing HTML/JavaScript architecture,
behaviour and simplicity. This is explicitly **not** a rewrite in React, Vue,
Angular or TypeScript, nor a migration to Vite or another toolchain for the sake
of modernization. The absence of a build pipeline is a feature of this codebase,
and we intend to keep it.

We aim to keep the divergence from upstream as small as reasonably possible.
Changes that are generic and potentially useful to mindmaps itself are kept
small and self-contained, so that they can also be offered upstream as
independent pull requests when appropriate.

### Branches

* `master` tracks [drichard/mindmaps](https://github.com/drichard/mindmaps)
  and only ever moves by fast-forward synchronization. No eXeLearning-specific
  commit is made on it.
* `main` is the eXeLearning maintenance branch. All maintenance work is
  developed in feature branches and merged into `main` through pull requests.

Background and context for this decision:
[drichard/mindmaps#107](https://github.com/drichard/mindmaps/issues/107).


# mindmaps
mindmaps is a HTML5 based mind mapping application. It lets you create neat looking mind maps in the browser.

This project started in 2011 as an exploration into what's possible to do in browsers using modern APIs. Nowadays, most of this stuff is pretty common and the code base is a bit outdated. This was way before React, ES6, webpack. Heck, it doesn't even use Backbone.

However, there is no reason to change any of that and it makes the code base quite easy to grok. There is no compilation step, no babel plugins, no frameworks. Just a JavaScript application and a very simple Model-View-Presenter pattern.

## HTML5 stuff which was cool in 2011
- 100% offline capable via ApplicationCache
- Stores mind maps in LocalStorage
- FileReader API reads stored mind maps from the hard drive
- Canvas API draws the mind map

## Try it out
The latest stable build is hosted [here](https://www.mindmaps.app).

## Build
* First run `npm install` to install required dependencies
* Run `npm run start` to launch a local dev server. The app will be hosted at [http://localhost:3000](http://localhost:3000).
* Run `npm run build` to compile the production bundle. The artifacts will be located in `/dist`.


## Host yourself
All you need is a web server for static files. After building, copy all files from /dist into your web directory and launch the app with index.html.
Make sure your web server serves .appcache files with the mime type `text/cache-manifest` for the application to
be accessible offline.

In Apache add the following line to your .htaccess:

```
AddType text/cache-manifest .appcache
```

In nginx add this to conf/mime.types:

```
text/cache-manifest appcache; 
```

Alternatively, you can launch a local debug server with `npm start` which starts a server on localhost:8080.

## License
mindmaps is licensed under AGPL V3, see LICENSE for more information.
