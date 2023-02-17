# v-pdf-highlighter

`v-pdf-highlighter` is a [React](https://reactjs.org/) library that provides a read only annotation experience for PDF documents on web. It is a fork of "react-pdf-highlighter", built on top of PDF.js by Mozilla. Text and rectangular highlights are supported. Highlight
data format is independent of the viewport, making it suitable for saving on the server.

### Example

To run the example app locally:

```
npm install
npm start
```

### Installation

`npm install v-pdf-highlighter`

See
[`./example/src/App.tsx`](https://github.com/velvetfs/v-pdf-highlighter/blob/main/example/src/App.tsx)
for React component API example.

### Prior art

[`react-pdf`](https://github.com/wojtekmaj/react-pdf) and
[`react-pdfjs`](https://github.com/erikras/react-pdfjs) only provide React
wrappers for PDF.js and do not have built-in annotation functionality.

[`pdfjs-annotate`](https://github.com/instructure/pdf-annotate.js/) does not
provide text highlights out of the box.

PDF.js provides only viewer:

> [PDF.js is mainly written for reading PDF files, not editing them. Because of that we don't yet support adding any kind of annotations. We do however support rendering a number of annotation types for viewing.](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#is-it-possible-to-add-annotations-to-a-pdf)

See also:

- https://github.com/mozilla/pdf.js
- https://github.com/wojtekmaj/react-pdf
- https://github.com/erikras/react-pdfjs
- https://github.com/instructure/pdf-annotate.js/
- https://blogs.dropbox.com/tech/2016/11/annotations-on-document-previews/

### FAQ

##### Can I get a new PDF with the highlights embedded into the document?

Take a look at https://pdf-lib.js.org.

##### Wasn't this named react-pdf-annotator at some point?

Yes, but people from https://www.pdfannotator.com/ asked me to rename, since [they have a trademark for PDF Annotator](https://www.pdfannotator.com/en/help/infodisclaimer).

##### I'm trying the demo with my PDF and it is not loading!

Please check the [CORS headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on your url. It is required for the cross-domain request.

### Compatibility

Works in Google Chrome, Safari 10+, Firefox 52+. Not tested in Internet
Explorer.
