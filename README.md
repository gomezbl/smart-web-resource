### Work in progress
Smart web resource (SWR) is an express middleware to serve resources (images, css, whatever) using transformations given by plugins.

Some samples:

Retrieve an image resized to 240 pixels width:

```
https://myhost/swr/resize:w(240)/images/cat.jpg
```

This can be done because "resize" is a node module added as a splugin to SWR.

Get minified css file:

```
https://myhost/swr/cssminifier/css/styles.css
```

Work in progress and first stable version available on december 2019.