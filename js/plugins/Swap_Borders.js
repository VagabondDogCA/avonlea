/*:
 * @target MZ
 * @plugindesc Dynamically swap the window border image by changing a variable.
 * @help Swap_Borders.js
 *
 * This plugin allows you to change the window border image (window.png)
 * dynamically by setting a variable. The new image will be used immediately.
 *
 * Usage:
 * - Set the variable ID in the plugin parameter.
 * - Assign a value to the variable in-game (e.g., 1 for window1, 2 for window2).
 * - The plugin will automatically update the window skin.
 *
 * @param VariableID
 * @text Variable ID
 * @type variable
 * @desc The variable ID used to determine the window skin file.
 * @default 1
 */

(() => {
    const parameters = PluginManager.parameters('Swap_Borders');
    const variableId = Number(parameters['VariableID'] || 1);

    const _Window_Base_loadWindowskin = Window_Base.prototype.loadWindowskin;
    Window_Base.prototype.loadWindowskin = function() {
        const variableValue = $gameVariables.value(variableId);
        const filename = variableValue > 0 ? `window${variableValue}` : 'window';
        this.windowskin = ImageManager.loadSystem(filename);
        _Window_Base_loadWindowskin.call(this); // Call the original method
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        const variableValue = $gameVariables.value(variableId);
        const filename = variableValue > 0 ? `window${variableValue}` : 'window';
        if (this._currentWindowSkin !== filename) {
            this._currentWindowSkin = filename;
            Window_Base.prototype.loadWindowskin.call(this); // Call the overridden method
        }
    };
})();
