/*:
 * @target MZ
 * @plugindesc Replaces the default window border scaling with a tiling approach for all windows.
 * @author YourName
 * @help
 * This plugin modifies the rendering of window borders in RPG Maker MZ.
 * Instead of scaling the border graphics, it tiles them to create a repeating
 * pattern across the edges of the window.
 */

(() => {
    const BORDER_SIZE = 24; // Size of the border quadrants in the Window.png

    Window.prototype._renderFrame = function() {
        const bitmap = this.windowskin;
        const context = this._context;
        const width = this.width;
        const height = this.height;
        const margin = this._margin;
        const borderSize = BORDER_SIZE;

        if (!bitmap || !bitmap.isReady()) {
            return;
        }

        context.save();
        context.globalCompositeOperation = "source-over";

        // Top border
        for (let x = borderSize; x < width - borderSize; x += borderSize) {
            context.drawImage(bitmap._canvas, borderSize, 0, borderSize, borderSize, x, 0, borderSize, borderSize);
        }

        // Bottom border
        for (let x = borderSize; x < width - borderSize; x += borderSize) {
            context.drawImage(bitmap._canvas, borderSize, borderSize * 3, borderSize, borderSize, x, height - borderSize, borderSize, borderSize);
        }

        // Left border
        for (let y = borderSize; y < height - borderSize; y += borderSize) {
            context.drawImage(bitmap._canvas, 0, borderSize, borderSize, borderSize, 0, y, borderSize, borderSize);
        }

        // Right border
        for (let y = borderSize; y < height - borderSize; y += borderSize) {
            context.drawImage(bitmap._canvas, borderSize * 3, borderSize, borderSize, borderSize, width - borderSize, y, borderSize, borderSize);
        }

        // Corners
        context.drawImage(bitmap._canvas, 0, 0, borderSize, borderSize, 0, 0, borderSize, borderSize); // Top-left
        context.drawImage(bitmap._canvas, borderSize * 3, 0, borderSize, borderSize, width - borderSize, 0, borderSize, borderSize); // Top-right
        context.drawImage(bitmap._canvas, 0, borderSize * 3, borderSize, borderSize, 0, height - borderSize, borderSize, borderSize); // Bottom-left
        context.drawImage(bitmap._canvas, borderSize * 3, borderSize * 3, borderSize, borderSize, width - borderSize, height - borderSize, borderSize, borderSize); // Bottom-right

        context.restore();
    };
})();
