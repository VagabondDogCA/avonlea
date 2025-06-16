/*:
 * @target MZ
 * @plugindesc Allows copying a .epub file from the /books folder using the native file explorer.
 * @help This plugin allows you to copy a specified .epub file from the /books folder.
 * 
 * @param epubFileName
 * @text EPUB File Name
 * @desc The name of the .epub file to copy (must be in the /books folder).
 * @default 01_the_little_mermaid.epub
 * 
 * @command copyEpub
 * @text Copy EPUB File
 * @desc Prompts the user to copy the specified .epub file.
 */

(() => {
    const pluginName = "CopyBook";
    const parameters = PluginManager.parameters(pluginName);
    const epubFileName = parameters['epubFileName'] || '01_the_little_mermaid.epub';

    PluginManager.registerCommand(pluginName, "copyEpub", args => {
        const { exec } = require('child_process');
        const path = require('path');
        const fs = require('fs');

        // Adjust the source path to point to the /books folder
        const sourcePath = path.join(__dirname, 'books', epubFileName);
        const destinationPath = path.join(process.env.USERPROFILE, 'Desktop', epubFileName);

        if (fs.existsSync(sourcePath)) {
            exec(`copy "${sourcePath}" "${destinationPath}"`, (error) => {
                if (error) {
                    console.error(`Error copying file: ${error.message}`);
                } else {
                    console.log(`File copied to ${destinationPath}`);
                }
            });
        } else {
            console.error(`File not found: ${sourcePath}`);
        }
    });
})();
