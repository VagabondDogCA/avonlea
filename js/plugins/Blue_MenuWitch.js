//=============================================================================
// Bluemoon Plugins - MZ - "WITCH" from Menu Collection for RPG MAKER MZ
// Blue_MenuWitch.js   VERSION 1.0.0
//=============================================================================

var Imported = Imported || {};
Imported.Blue_MenuWitch = true;

var Bluemoon = Bluemoon || {};
Bluemoon.MenuWitch = Bluemoon.MenuWitch || {};

//=============================================================================
 /*:
 * @target MZ
 * @URL 
 * @plugindesc v1.0.0 "WITCH" - #2 Release for Menu Collection
 * @author Bluemoon || Nebula Games
 * @help
 * CHANGELOG:
 * VERSION 1.0.0: Plugin Released!
 *
 * @param Age Var
 * @desc The variable ID for the Age value
 * @type variable
 * @default 1
 * 
 * @param Mood Var
 * @desc The variable ID for the Mood value
 * @type variable
 * @default 2
 * 
 * @param Outfit Var
 * @desc The variable ID for the Outfit value
 * @type variable
 * @default 3
 * 
 * @param Task Var
 * @desc The variable ID for the Task value
 * @type variable
 * @default 4
 * 
 * @param Season Var
 * @desc The variable ID for the Season value
 * @type variable
 * @default 5
 * 
 * @param Load Command Text
 * @desc The text for the load command
 * @type text
 * @default Load
 * 
 * @param Animation Speed
 * @desc The window animation speed
 * @type number
 * @default 24
 * 
 * @param Use Witch Item System?
 * @desc Use one-actor inventory system
 * @type boolean
 * @on YES
 * @off NO
 * @default true
 * 
 * @param Actor Image
 * @desc The filename of the picture to display in the actor image area
 * @type file
 * @dir img/pictures
 * @default ActorImage
 * 
 * @param Sprite Character
 * @desc The character sprite filename to display for the outfit
 * @type file
 * @dir img/characters
 * @default Actor1
 */
 //=============================================================================

(function($) {

	const Parameters = PluginManager.parameters("Blue_MenuWitch");
	const _age_var = parseInt(Parameters["Age Var"]);
	const _mood_var = parseInt(Parameters["Mood Var"]);
	const _outfit_var = parseInt(Parameters["Outfit Var"]);
	const _task_var = parseInt(Parameters["Task Var"]);
	const _season_var = parseInt(Parameters["Season Var"]);
	const _load_command_text = String(Parameters["Load Command Text"]);
	const _animation_speed = parseInt(Parameters["Animation Speed"])
	const _use_witch_item_system = JSON.parse(Parameters["Use Witch Item System?"])
	let _actor_image = String(Parameters["Actor Image"] || "")
	const _sprite_character = String(Parameters["Sprite Character"] || "Actor1")

	// Add a function to change the actor image filename
	Bluemoon.MenuWitch.setActorImage = function(filename) {
		_actor_image = filename;
	};

	//###############################################################################
	//
	// WINDOW MENU COMMAND
	//
	//###############################################################################

	Window_MenuCommand = class extends Window_MenuCommand {

		// Adjust button height proportionally
		itemHeight() {
			return Math.floor(this.lineHeight() * 1.5); // Increase button height by 50%
		}

		// Adjust window height to fit the taller buttons
		windowHeight() {
			return this.fittingHeight(this.maxItems());
		}

		makeCommandList() {
			this.addCommand("Resume", "resume", true); // Changed "Items" to "Resume"
			this.addCommand(TextManager.save, "save", this.isSaveEnabled());
			this.addCommand(_load_command_text, "load", true);
			this.addCommand("Menu", "options", this.isOptionsEnabled());
			this.addCommand("Quit", "gameEnd", true);
			this.addOriginalCommands();
		}

		maxCols() { return 1; }

		// Simplified drawItem to use a single off-white color for all buttons
		drawItem(index) {
			const rect = this.itemLineRect(index);
			this.changeTextColor("#f0f0f0"); // Just off-white color
			this.drawText(this.commandName(index), rect.x, rect.y, rect.width, "center");
			this.resetTextColor();
		}
	}

	//###############################################################################
	//
	// SCENE MENU
	//
	//###############################################################################

	Scene_Menu = class extends Scene_Menu {

		create() {
			super.create();
			this._loadSuccess = false;
			this._statusWindow.hide();
			this._goldWindow.parent.removeChild(this._goldWindow);
			this._commandWindow.setHandler("resume", () => { // Added handler for "Resume"
				SceneManager.pop(); // Close the menu
			});
			this._commandWindow.setHandler("load", () => {
				this.commandLoad(); // Updated to call a simple load command
			});
			this._commandWindow.setHandler("item", () => {
				SceneManager.push(Scene_Item);
			});
			this._commandWindow.setHandler("save", () => {
				this.commandSave();
			});
			this._commandWindow.setHandler("gameEnd", () => {
				this.commandGameEnd();
			});
			this._commandWindow.setHandler("options", () => {
				SceneManager.push(Scene_Options);
			});
			this.createTaskWindow(); // Add the task window
			this._statusWitch = new Window_StatusWitch(this.statusWitchRect());
			this._statusWitch.refresh();
			this.addWindow(this._statusWitch);

			this.createListWindow();
			this.createItemSystem();

			if (!!this._buttonAssistWindow) {
				this._buttonAssistWindow.hide();
			}
		}

		commandLoad() {
			SceneManager.push(Scene_Load); // Directly push the load scene
		}

		createTaskWindow() {
			const rect = this.taskWindowRect();
			this._taskWindow = new Window_Task(rect);
			this.addWindow(this._taskWindow);
		}

		taskWindowRect() {
			const commRect = this.commandWindowRect();
			const width = Graphics.boxWidth;
			const height = Math.floor(Graphics.boxHeight / 6); // Adjusted height for the taskbar
			const x = 0; // Full width
			const y = commRect.y - height; // Align to the top of the menu
			return new Rectangle(x, y, width, height);
		}

		commandWindowRect() {
			const rect = new Rectangle();
			rect.width = Math.floor(Graphics.boxWidth / 4); // Reduced width for the menu
			rect.height = Math.floor(Window_Base.prototype.lineHeight.call(this) * 8.5) - 7; // Decreased height by another 4px
			rect.x = 0;
			rect.y = Graphics.boxHeight - rect.height;
			return rect;
		}

		statusWitchRect() {
			const commRect = this.commandWindowRect();
			const rect = new Rectangle();
			rect.x = commRect.width;
			rect.width = Graphics.boxWidth - commRect.width;
			rect.height = commRect.height; // Match height of the command window
			rect.y = Graphics.boxHeight - rect.height;
			return rect;
		}

		listWindowRect() {
			const commRect = this.commandWindowRect();
			const rect = new Rectangle();
			rect.height = Graphics.boxHeight - commRect.height;
			rect.width = Graphics.boxWidth;
			rect.x = 0;
			rect.y = -rect.height * 1.2;
			return rect;
		}

		update() {
			super.update();
			if(this._listWindow.active) {
				if(this._listWindow.y < 0) {
					this._listWindow.y = Math.min(0, this._listWindow.y + _animation_speed)
				}
			}
			else {
				if(this._listWindow.y > -this._listWindow.height*1.2) {
					this._listWindow.y = Math.max(-this._listWindow.height*1.2, this._listWindow.y - _animation_speed)
				}				
			}

			this.animateWitchItemSystem();
		}

		animateWitchItemSystem() {
			if(!_use_witch_item_system) {return;}
			if(this._itemWindow.active) {
				if(this._commandWindow.x > -this._commandWindow.width*1.2) {
					this._commandWindow.x = Math.max(-this._commandWindow.width*1.2, this._commandWindow.x - _animation_speed)
				}
				if(this._statusWitch.x < Graphics.boxWidth) {
					this._statusWitch.x = Math.min(Graphics.boxWidth*1.2, this._statusWitch.x + _animation_speed)

				}
				if(this._itemWindow.y > Graphics.boxHeight - this._itemWindow.height) {
					this._itemWindow.y = Math.max(Graphics.boxHeight - this._itemWindow.height, this._itemWindow.y - _animation_speed)

				}
			}
			else {
				if(this._commandWindow.x < 0) {
					this._commandWindow.x = Math.min(0, this._commandWindow.x + _animation_speed)
				}
				if(this._statusWitch.x > Graphics.boxWidth - this._statusWitch.width) {
					this._statusWitch.x = Math.max(Graphics.boxWidth - this._statusWitch.width, this._statusWitch.x - _animation_speed)

				}
				if(this._itemWindow.y < Graphics.boxHeight*1.2) {
					this._itemWindow.y = Math.min(Graphics.boxHeight*1.2, this._itemWindow.y + _animation_speed)

				}
			}
		}

		createListWindow() {
			const rect = this.listWindowRect();
			this._listWindow = new Window_SavefileList(rect);
			this._listWindow.setHandler("ok", this.onSavefileOk.bind(this));
			this._listWindow.setHandler("cancel", () => {
				this._commandWindow.activate()
			});
			this._listWindow.setMode("load", $gameSystem.isAutosaveEnabled());
			this._listWindow.selectSavefile(DataManager.latestSavefileId());
			this._listWindow.refresh();
			this._listWindow.deactivate();
			this.addWindow(this._listWindow);
		}

		terminate() {
			super.terminate();
			if (this._loadSuccess) {
				$gameSystem.onAfterLoad();
			}
		}

		itemListRect() {
			const commRect = this.commandWindowRect();
			const rect = new Rectangle();
			rect.height = commRect.height;
			rect.width = Graphics.boxWidth
			rect.x = 0
			rect.y = Graphics.boxHeight*1.2;
			return rect;			
		}

		createItemSystem() {
			if(!_use_witch_item_system) {return;}
			this._itemWindow = new Window_WitchItemList(this.itemListRect())
			this.addWindow(this._itemWindow);
			
			this._helpWindow = new Window_Help(this.helpWindowRect())
			this.addWindow(this._helpWindow);
			this._helpWindow.openness = 0;

			this._itemWindow.setHelpWindow(this._helpWindow);
			this._itemWindow.setHandler("cancel", () => {
				this._commandWindow.activate();
				this._helpWindow.close()
			})
			this._itemWindow.setHandler("ok", () => {
				const item = this._itemWindow.item()
				$gameParty.setLastItem(item);
				const action = new Game_Action(this.user());
				action.setItemObject(item);
				this.useItem();
				this._itemWindow.activate();
			})

			this._commandWindow.setHandler("item", () => {
				this._itemWindow.activate();
				this._itemWindow.refresh();
				this._itemWindow.select(0);
				this._helpWindow.open()
			})

			if(!this._actorWindow) {
				this._actorWindow = {refresh: ()=>{}}
			}
		}

		user() {return $gameParty.leader()}
		item() {return this._itemWindow.item()}

		playSeForItem() {return Scene_Item.prototype.playSeForItem.call(this)}
		useItem() {return Scene_ItemBase.prototype.useItem.call(this)}
		applyItem() {return Scene_ItemBase.prototype.applyItem.call(this)}
		checkCommonEvent() {return Scene_ItemBase.prototype.checkCommonEvent.call(this)}
		checkGameover() {return Scene_ItemBase.prototype.checkGameover.call(this)}

		itemTargetActors() {return [$gameParty.leader()]}

		helpAreaTop() {
			const commRect = this.commandWindowRect();
			return commRect.y - this.helpAreaHeight()
		}

		helpAreaHeight() {
			return Window_Base.prototype.lineHeight.call(this) * 2.5; // Adjusted for better spacing
		}

		// Methods for Save System

		onSavefileOk() {return Scene_Load.prototype.onSavefileOk.call(this)}
		executeLoad(savefileId) {return Scene_Load.prototype.executeLoad.call(this,savefileId)}
		onLoadSuccess() {return Scene_Load.prototype.onLoadSuccess.call(this)}
		onLoadFailure() {
			SoundManager.playBuzzer();
			this._listWindow.activate()
		}
		reloadMapIfUpdated() {return Scene_Load.prototype.reloadMapIfUpdated.call(this)}
		onSavefileOk() {return Scene_Load.prototype.onSavefileOk.call(this)}

		savefileId() {return Scene_Load.prototype.savefileId.call(this)}
		isSavefileEnabled(savefileId) {return Scene_Load.prototype.isSavefileEnabled.call(this,savefileId)}
		
	}

	//###############################################################################
	//
	// WINDOW TASK
	//
	//###############################################################################

	class Window_Task extends Window_Base {

		initialize(rect) {
			super.initialize(rect);
			this.refresh();
		}

		refresh() {
			this.contents.clear();
			this.contents.fontSize += 6;

			// Draw Task Title (centered, pale blue color)
			this.changeTextColor("#a3c9f1"); // Pale blue color
			this.drawText("Current Task", 0, 0, this.contents.width, "center");
			this.resetTextColor();
			this.resetFontSettings();

			// Draw Task Content (centered and word-wrapped)
			const taskContentY = this.lineHeight() * 1.5 - 4; // Add spacing below the title and move up by 4px
			const taskContent = String($gameVariables.value(_task_var) || ""); // Ensure taskContent is a string
			this.drawWordWrappedText(taskContent, 0, taskContentY, this.contents.width);
		}

		// Helper function for word wrapping
		drawWordWrappedText(text, x, y, maxWidth) {
			const words = text.split(" ");
			let line = "";
			let lineY = y;

			words.forEach((word) => {
				const testLine = line + word + " ";
				const testWidth = this.textWidth(testLine);
				if (testWidth > maxWidth) {
					this.drawText(line, x, lineY, maxWidth, "center");
					line = word + " ";
					lineY += this.lineHeight();
				} else {
					line = testLine;
				}
			});

			this.drawText(line, x, lineY, maxWidth, "center");
		}
	}

	class Window_StatusWitch extends Window_StatusBase {

		refresh() {
			super.refresh();
			const margin = 12;
			const nameBuffer = 6; // Increased buffer beneath the name
			const nameTopBuffer = 4; // Added 4px buffer above the name
			const columnWidth = Math.floor((this.contents.width - margin * 5) / 4); // Divide the table into four equal columns
			const rowHeight = this.contents.height - this.lineHeight() - margin * 2 - 14; // Reduced height by 4px
			const spacing = this.lineHeight() * 1.2; // Increased spacing between names and data

			// Draw Actor Name (left-aligned at the top, pale yellow color)
			this.contents.fontSize += 7; // Increased font size by 1
			this.changeTextColor("#f9e79f"); // Pale yellow color
			this.drawText("Marilla Cuthbert", margin, nameTopBuffer, this.contents.width - margin * 2, "left");
			this.resetTextColor();
			this.resetFontSettings();

			// Column 1: Actor Image
			const imageX = margin + (columnWidth - ImageManager.faceWidth) / 2; // Center horizontally in the column
			const imageY = this.lineHeight() + margin + nameBuffer; // Add buffer beneath the name
			this.drawActorImage(imageX, imageY);

			// Column 2: Age and Mood
			const statsX = margin + columnWidth + margin;
			const statsY = this.lineHeight() + margin;
			this.changeTextColor("#a8d5ba"); // Softer green color for titles
			this.drawText("Age", statsX, statsY, columnWidth, "center");
			this.resetTextColor();
			this.drawText($gameVariables.value(_age_var), statsX, statsY + spacing, columnWidth, "center");

			this.changeTextColor("#a8d5ba"); // Softer green color for titles
			this.drawText("Mood", statsX, statsY + spacing * 2, columnWidth, "center");
			this.resetTextColor();
			this.drawText($gameVariables.value(_mood_var), statsX, statsY + spacing * 3, columnWidth, "center");

			// Column 3: Outfit (render mannequin image)
			const outfitX = statsX + columnWidth + margin;
			const outfitY = statsY;
			this.changeTextColor("#a8d5ba"); // Softer green color for titles
			this.drawText("Outfit", outfitX, outfitY, columnWidth, "center");
			this.resetTextColor();
			this.drawOutfitImage(outfitX, outfitY + spacing);

			// Column 4: Season and Playtime
			const playtimeX = outfitX + columnWidth + margin;
			const playtimeY = statsY;
			this.changeTextColor("#a8d5ba"); // Softer green color for titles
			this.drawText("Season", playtimeX, playtimeY, columnWidth, "center");
			this.resetTextColor();
			this.drawText($gameVariables.value(_season_var), playtimeX, playtimeY + spacing, columnWidth, "center");

			this.changeTextColor("#a8d5ba"); // Softer green color for titles
			this.drawText("Playtime", playtimeX, playtimeY + spacing * 2, columnWidth, "center");
			this.resetTextColor();
			this.drawText($gameSystem.playtimeText(), playtimeX, playtimeY + spacing * 3, columnWidth, "center");
		}

		drawActorImage(x, y) {
			const bitmap = ImageManager.loadPicture(_actor_image);
			bitmap.smooth = false; // Nearest-neighbor scaling
			bitmap.addLoadListener(() => {
				const imageWidth = bitmap.width;
				const imageHeight = bitmap.height;
				this.contents.blt(bitmap, 0, 0, imageWidth, imageHeight, x, y); // Render full image
			});
		}

		drawOutfitImage(x, y) {
			const outfitVarValue = $gameVariables.value(_outfit_var);
			const outfitImageName = `mannequin${outfitVarValue}`; // e.g., "mannequin1.png"
			const bitmap = ImageManager.loadPicture(outfitImageName);
			bitmap.smooth = false; // Nearest-neighbor scaling
			bitmap.addLoadListener(() => {
				const columnWidth = Math.floor((this.contents.width - 12 * 5) / 4); // Column width
				const centeredX = x + (columnWidth - bitmap.width) / 2; // Center horizontally in the column
				const centeredY = y + this.lineHeight() * 0.5; // Position just below the "Outfit" header
				this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, centeredX, centeredY);
			});
		}
	}

	Scene_Menu.prototype.commandWindowRect = function() {
		const rect = new Rectangle();
		rect.width = Math.floor(Graphics.boxWidth / 4); // Reduced width for the menu
		rect.height = Math.floor(Window_Base.prototype.lineHeight.call(this) * 8.5) - 7; // Decreased height by another 4px
		rect.x = 0;
		rect.y = Graphics.boxHeight - rect.height;
		return rect;
	};

	Scene_Menu.prototype.statusWitchRect = function() {
		const commRect = this.commandWindowRect();
		const rect = new Rectangle();
		rect.x = commRect.width;
		rect.width = Graphics.boxWidth - commRect.width;
		rect.height = commRect.height; // Match height of the command window
		rect.y = Graphics.boxHeight - rect.height;
		return rect;
	};

	Scene_Menu.prototype.taskWindowRect = function() {
		const commRect = this.commandWindowRect();
		const width = Graphics.boxWidth;
		const height = Math.floor(Graphics.boxHeight / 6); // Adjusted height for the taskbar
		const x = 0; // Full width
		const y = commRect.y - height; // Align to the top of the menu
		return new Rectangle(x, y, width, height);
	};

	//###############################################################################
	//
	// WINDOW WITCH ITEM LIST
	//
	//###############################################################################

	class Window_WitchItemList extends Window_ItemList {

		includes(item) {
			return DataManager.isItem(item)
		}
	}


})(Bluemoon.MenuWitch);