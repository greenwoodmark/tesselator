
# Tesselator app

The goal of this project is to create an application that produces tesselated surfaces like those of MC Escher.
Starting with a base figure of a square, we can click and drag on the outline to change the shape of the outline of the figure in such a way that these changes are mirrored on the opposite side such that the shape always does not change when rotated by 180 degrees AND the base figure tesselates with itself. So changes to the left (right) side are translated to the inverse change on the right (left) side such that repetitions of the shape side by side interlock. Simlarly changes to the bottom (top) side are translated to the inverse change on the top (bottom) side such that repetitions of the shape stacked on top of each other interlock. 

(C:\Users\markr\Documents\tesselation>c:\Users\markr\Documents\tesselation\tess_venv\Scripts\activate.bat is used to activate the venv I intend to run it in)

## TODO:
See Gemini's advice at `https://share.gemini.google/XjCYTjmhRyb8` regarding how to use `MobileNet1 and 1Quick, Draw!` dataset of 340 or so sketch category outlines to recognise Dominik's draft from tesselator app and snap it to the selected sketch category (e.g. cat). The interior can be filled out with say a Pix2Pix model trained on some Escher tesselations.

```
To achieve internal lines that match Escher’s style—clean, minimalist, high-contrast vector strokes without shading or complex textures—you should avoid Diffusion entirely. Diffusion is optimized for gradients and photorealism, whereas this image consists purely of semantic vector strokes (an eye, an operculum, fin details).

Your best approach is a Pix2Pix (Conditional GAN), but with a highly specific training configuration focused on edge-to-edge (or silhouette-to-stroke) translation, rather than rendering pixels.

Here is the exact strategy to achieve this bold, graphic output while keeping it lightweight enough for your website:

1. Vector Training Data Preparation
To teach the model to paint like Escher, you must train it on high-contrast data that lacks gradients.

Source Data: Collect or generate a dataset of simple vector line drawings of your target object (e.g., stylized fish, birds, lizards).

Paired Inputs: For every image, create an automated preprocessing script:

Input Image (X): Fill the interior of the vector completely to create a solid, monochrome silhouette.

Target Image (Y): Keep only the internal semantic lines (the skeletal detail lines), rendered as clean, single-pixel-width or fixed-width strokes.

The Loss Trick: Standard Pix2Pix uses a combination of L1 loss (which calculates absolute pixel differences) and an adversarial loss. For ultra-sharp lines like Escher's, you should increase the weight of the adversarial loss (the discriminator) or use a Dice loss or Focal loss variant. This penalizes the model heavily for blurring or smudging lines, forcing it to make definitive binary choices (either solid line or solid background).

2. Modifying the Output Format (Vectorization)
Even with strict loss functions, a neural network outputting a PNG or JPEG grid can introduce tiny amounts of anti-aliasing fuzz at the edges of the strokes. To get the perfect, infinitely scalable vector look seen in the Escher image:

Have your Pix2Pix model output a high-contrast grayscale image.

Apply a hard threshold filter in your client-side JavaScript to convert the output to strict binary black and white, eliminating any gray pixels:

JavaScript
// Pseudo-code for thresholding a canvas context
for (let i = 0; i < data.length; i += 4) {
  let brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
  let color = (brightness > 127) ? 255 : 0;
  data[i] = data[i+1] = data[i+2] = color;
}
Pass this thresholded matrix to a lightweight Javascript tracing library, such as Potrace. This converts the generated pixel lines back into smooth, mathematical SVG paths (<path>).
```