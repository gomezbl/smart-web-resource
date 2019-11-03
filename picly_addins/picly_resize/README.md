# Resize Picly plugin

## Action name: _resize_
This Picly core addin resizes an image to a different width or height.
If one of the parameters are missin, resize addin maintains aspect ratio of the  image.
If width and height parameters are set, then the addin force image to those dimensions.
If no parameters are set, then the image will be set to 120 pixels width.
In any case, minimun value between width set in the parameter and the image width will be considered, the same for height parameter.

## Parameters

### w - integer, optional
Width in pixels for the image.

### h - integer, optional
Height in pixels for the image.

## Samples


![imagen1][img1]

The original image size 600x338.

### resize:w(420).

![imagen2][img4]

The image will be served with 420 pixels width and the height will be scaled according to that new width. Aspect ratio is maintainted. If original image width is lower than 420, then the destination image will be set to that lower value.

### resize:w(220),h(110).

![imagen3][img2]
	
With this request, "Happy-woman.jpg" will be served with 220px width and 110 pixels height. Aspect ratio in this case is not maintained.

### resize:h(100).

![imagen4][img3]
	
The image will be served with 100 pixels height and the image will be sacled according to that new height. Aspect ratio is maintained. If original image height is lower than 100, then the destination image will be set to that lower value.

### resize.

![imagen5][img5]

No width and height set in parameters. In that case, the addin will set the destination image to 120 pixels width maintaining aspect ratio (or original image width if it is lower than 120).



[img1]: /examples/resize_original1.jpg
[img2]: /examples/resize_modwh.jpg
[img3]: /examples/resize_modh100.jpg
[img4]: /examples/resize_mod420.jpg
[img5]: /examples/resize_mod1.jpg