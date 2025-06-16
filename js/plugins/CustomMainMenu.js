/*:
 * @plugindesc Custom Main Menu for RPG Maker MZ
 * @author TheStrahl
 * 
 * @param backgroundImage
 * @text Background Image
 * @desc The parallax background image for all menu scenes (in img/parallaxes/).
 * @type file
 * @dir img/parallaxes/
 * @default 
 * 
 * @param parallaxHorizontalSpeed
 * @text Parallax Horizontal Speed
 * @desc Horizontal scroll speed for the parallax background (e.g., 1 = right, -1 = left).
 * @type number
 * @default 1
 * 
 * @param parallaxVerticalSpeed
 * @text Parallax Vertical Speed
 * @desc Vertical scroll speed for the parallax background (e.g., 1 = down, -1 = up).
 * @type number
 * @default 0
 * 
 * @param menuMusic
 * @text Menu Music
 * @desc The music file to play in all menu scenes (in audio/bgm/).
 * @type file
 * @dir audio/bgm/
 * @default 
 * 
 * @param musicVolume
 * @text Music Volume
 * @desc Volume for the menu music (0-100).
 * @type number
 * @min 0
 * @max 100
 * @default 80
 * 
 * @param musicPitch
 * @text Music Pitch
 * @desc Pitch for the menu music (50-150, 100 = normal).
 * @type number
 * @min 50
 * @max 150
 * @default 100
 * 
 * @help
 * Customizes the main menu in RPG Maker MZ:
 * - Main Menu: Playtime, gold, step count windows (1/3 screen width each) at bottom, command on right, status on left.
 * - Parallax background extends to all menu scenes; music plays once on menu entry, forces map BGM on exit.
 * - Main menu character info: Random portrait from sheet (8 expressions), name centered above, HP/MP/TP beside, EXP and AP on right.
 * 
 * Compatible with SkillLearningSystem.js and EquipmentUpgradeSystem.js (if used).
 * 
 * **Parameters:**
 * - Background Image: Parallax file (e.g., "Sky").
 * - Parallax Horizontal Speed: Scroll speed left/right (e.g., 1 = right, -1 = left).
 * - Parallax Vertical Speed: Scroll speed up/down (e.g., 1 = down, -1 = up).
 * - Menu Music: BGM file (e.g., "Theme1").
 * - Music Volume: Volume level (default: 80).
 * - Music Pitch: Pitch adjustment (default: 100, normal).
 */

(() => {
  const parameters = PluginManager.parameters('CustomMainMenu');
  const backgroundImage = parameters['backgroundImage'] || '';
  const parallaxHorizontalSpeed = Number(parameters['parallaxHorizontalSpeed']) || 1;
  const parallaxVerticalSpeed = Number(parameters['parallaxVerticalSpeed']) || 0;
  const menuMusic = parameters['menuMusic'] || '';
  const musicVolume = Number(parameters['musicVolume']) || 80;
  const musicPitch = Number(parameters['musicPitch']) || 100;

  // Global BGM state
  let _currentMapBgm = null;
  let _menuMusicActive = false;

  // Capture map BGM before entering any menu
  const _Scene_Map_terminate = Scene_Map.prototype.terminate;
  Scene_Map.prototype.terminate = function() {
    _Scene_Map_terminate.call(this);
    if (SceneManager._nextScene instanceof Scene_MenuBase) {
      _currentMapBgm = AudioManager.saveBgm();
    }
  };

  // Extend Parallax to Scene_MenuBase
  const _Scene_MenuBase_createBackground = Scene_MenuBase.prototype.createBackground;
  Scene_MenuBase.prototype.createBackground = function() {
    if (backgroundImage) {
      this._backgroundSprite = new TilingSprite();
      this._backgroundSprite.bitmap = ImageManager.loadParallax(backgroundImage);
      this._backgroundSprite.move(0, 0, Graphics.width, Graphics.height);
      this.addChildAt(this._backgroundSprite, 0);
    } else {
      _Scene_MenuBase_createBackground.call(this);
    }
  };

  const _Scene_MenuBase_update = Scene_MenuBase.prototype.update;
  Scene_MenuBase.prototype.update = function() {
    _Scene_MenuBase_update.call(this);
    if (this._backgroundSprite instanceof TilingSprite) {
      this._backgroundSprite.origin.x += parallaxHorizontalSpeed;
      this._backgroundSprite.origin.y += parallaxVerticalSpeed;
    }
  };

  // Menu Music Control
  const _Scene_Menu_start = Scene_Menu.prototype.start;
  Scene_Menu.prototype.start = function() {
    _Scene_Menu_start.call(this);
    if (menuMusic && !_menuMusicActive) {
      AudioManager.stopBgm();
      AudioManager.playBgm({ name: menuMusic, volume: musicVolume, pitch: musicPitch, pan: 0 });
      _menuMusicActive = true;
    }
  };

  const _Scene_MenuBase_terminate = Scene_MenuBase.prototype.terminate;
  Scene_MenuBase.prototype.terminate = function() {
    _Scene_MenuBase_terminate.call(this);
    if (_menuMusicActive && SceneManager._nextScene instanceof Scene_Map) {
      AudioManager.stopBgm();
      if (_currentMapBgm) {
        AudioManager.replayBgm(_currentMapBgm);
      }
      _menuMusicActive = false;
    }
  };

  // Main Menu Scene Customization
  const _Scene_Menu_create = Scene_Menu.prototype.create;
  Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    this.createGoldWindow();
    this.createStatusWindow();
    this.createPlayTimeWindow();
    this.createStepCountWindow();

    this._commandWindow.x = Graphics.boxWidth - 240;
    this._commandWindow.y = 72;
    this._commandWindow.width = 240;
    this._commandWindow.height = Graphics.boxHeight - 72 - 72;

    this._statusWindow.x = 0;
    this._statusWindow.y = 72;
    this._statusWindow.width = Graphics.boxWidth - 240;
    this._statusWindow.height = Graphics.boxHeight - 72 - 72;

    this._playTimeWindow.x = 0;
    this._playTimeWindow.y = Graphics.boxHeight - 72;
    this._playTimeWindow.width = Math.floor(Graphics.boxWidth / 3);
    this._playTimeWindow.height = 72;

    this._goldWindow.x = Math.floor(Graphics.boxWidth / 3);
    this._goldWindow.y = Graphics.boxHeight - 72;
    this._goldWindow.width = Math.floor(Graphics.boxWidth / 3);
    this._goldWindow.height = 72;

    this._stepCountWindow.x = Math.floor(2 * (Graphics.boxWidth / 3));
    this._stepCountWindow.y = Graphics.boxHeight - 72;
    this._stepCountWindow.width = Math.floor(Graphics.boxWidth / 3);
    this._stepCountWindow.height = 72;

    this._commandWindow.refresh();
    this._statusWindow.refresh();
    this._goldWindow.refresh();
    this._playTimeWindow.refresh();
    this._stepCountWindow.refresh();
  };

  const _Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
  Window_MenuCommand.prototype.makeCommandList = function() {
    _Window_MenuCommand_makeCommandList.call(this);
  };

  const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function() {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.refresh();
  };

  Scene_Menu.prototype.createPlayTimeWindow = function() {
    const rect = new Rectangle(0, Graphics.boxHeight - 72, Math.floor(Graphics.boxWidth / 3), 72);
    this._playTimeWindow = new Window_PlayTime(rect);
    this.addWindow(this._playTimeWindow);
  };

  Scene_Menu.prototype.createStepCountWindow = function() {
    const rect = new Rectangle(Math.floor(2 * (Graphics.boxWidth / 3)), Graphics.boxHeight - 72, Math.floor(Graphics.boxWidth / 3), 72);
    this._stepCountWindow = new Window_StepCount(rect);
    this.addWindow(this._stepCountWindow);
  };

  // Override Window_Gold to enforce size
  const _Window_Gold_initialize = Window_Gold.prototype.initialize;
  Window_Gold.prototype.initialize = function(rect) {
    rect.width = Math.floor(Graphics.boxWidth / 3);
    rect.height = 72;
    _Window_Gold_initialize.call(this, rect);
  };

  // Play Time Window
  function Window_PlayTime() {
    this.initialize.apply(this, arguments);
  }

  Window_PlayTime.prototype = Object.create(Window_Base.prototype);
  Window_PlayTime.prototype.constructor = Window_PlayTime;

  Window_PlayTime.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_PlayTime.prototype.refresh = function() {
    this.contents.clear();
    const playTime = $gameSystem.playtimeText();
    this.changeTextColor(ColorManager.textColor(4));
    this.drawText("Play Time:", 0, 0, 100); 
    this.resetTextColor();
    this.drawText(playTime, 100, 0, this.width - 100 - this.padding * 2, "left");
  };

  Window_PlayTime.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.refresh();
  };

  // Step Count Window
  function Window_StepCount() {
    this.initialize.apply(this, arguments);
  }

  Window_StepCount.prototype = Object.create(Window_Base.prototype);
  Window_StepCount.prototype.constructor = Window_StepCount;

  Window_StepCount.prototype.initialize = function(rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_StepCount.prototype.refresh = function() {
    this.contents.clear();
    const steps = $gameParty.steps();
    this.changeTextColor(ColorManager.textColor(4));
    this.drawText("Steps:", 0, 0, 100);
    this.resetTextColor();
    this.drawText(steps, 100, 0, this.width - 100 - this.padding * 2, "left");
  };

  Window_StepCount.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.refresh();
  };

  // Custom Menu Status Window with Random Portraits
  const _Window_MenuStatus_initialize = Window_MenuStatus.prototype.initialize;
  Window_MenuStatus.prototype.initialize = function(rect) {
    _Window_MenuStatus_initialize.call(this, rect);
    this._randomFaceIndices = []; // Array to store random face indices per actor
    this.randomizeFaceIndices();
  };

  Window_MenuStatus.prototype.standardPadding = function() {
    return 12;
  };

  Window_MenuStatus.prototype.refresh = function() {
    this.randomizeFaceIndices(); // Randomize faces each refresh
    this.contents.clear();
    this.drawAllItems();
    this.height = Graphics.boxHeight - 72 - 72;
  };

  Window_MenuStatus.prototype.randomizeFaceIndices = function() {
    const partySize = $gameParty.size();
    this._randomFaceIndices = [];
    for (let i = 0; i < partySize; i++) {
      this._randomFaceIndices[i] = Math.floor(Math.random() * 8); // 0-7 for 8 faces
    }
  };

  const _Window_MenuStatus_drawItem = Window_MenuStatus.prototype.drawItem;
  Window_MenuStatus.prototype.drawItem = function(index) {
    this.drawItemBackground(index);
    this.drawItemImage(index);
    this.drawItemStatus(index);
  };

  Window_MenuStatus.prototype.drawItemImage = function(index) {
    const actor = this.actor(index);
    const rect = this.itemRect(index);
    const width = 104;
    const height = 104;
    const faceIndex = this._randomFaceIndices[index] || 0; // Use random index
    this.changePaintOpacity(actor.isBattleMember());
    this.drawActorFace(actor, rect.x + 4, rect.y + 4, width, height, faceIndex);
    this.changePaintOpacity(true);
  };

  Window_MenuStatus.prototype.drawActorFace = function(actor, x, y, width, height, faceIndex) {
    const bitmap = ImageManager.loadFace(actor.faceName());
    const fw = ImageManager.faceWidth; // 144
    const fh = ImageManager.faceHeight; // 144
    const sx = (faceIndex % 4) * fw; // Column (0-3)
    const sy = Math.floor(faceIndex / 4) * fh; // Row (0-1)
    width = width || fw;
    height = height || fh;
    this.contents.blt(bitmap, sx, sy, fw, fh, x, y, width, height);
  };

  Window_MenuStatus.prototype.drawItemStatus = function(index) {
    const actor = this.actor(index);
    const rect = this.itemRect(index);
    const x = rect.x;
    const y = rect.y;
    const width = rect.width;
    const lineHeight = this.lineHeight();

    this.changeTextColor(ColorManager.normalColor());
    const nameWidth = this.textWidth(actor.name());
    const nameX = x + (112 - nameWidth) / 2;
    this.drawText(actor.name(), nameX, y, 112, "left");

    const paramX = x + 151;
    const gaugeX = paramX + 36;
    this.drawActorHp(actor, paramX, y + lineHeight * 0, 100, gaugeX);
    this.drawActorMp(actor, paramX, y + lineHeight * 1, 100, gaugeX);
    if ($dataSystem.optDisplayTp) {
      this.drawActorTp(actor, paramX, y + lineHeight * 2, 100, gaugeX);
    }

    const expX = x + width - 160;
    this.changeTextColor(ColorManager.textColor(4));
    this.drawText("To Next Level:", expX, y + lineHeight * 0, 100);
    this.drawText("EXP:", expX, y + lineHeight * 1, 40);
    this.changeTextColor(ColorManager.normalColor());
    const currentExp = actor.currentExp() - actor.currentLevelExp();
    const nextExp = actor.nextLevelExp() - actor.currentLevelExp();
    this.drawText(`${currentExp}/${nextExp}`, expX + 40, y + lineHeight * 1, 60, "right");

    this.changeTextColor(ColorManager.textColor(4));
    this.drawText("AP:", expX, y + lineHeight * 2, 40);
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(String(actor.ap()), expX + 40, y + lineHeight * 2, 60, "right");
  };

  Window_MenuStatus.prototype.itemHeight = function() {
    return 112;
  };

  Window_MenuStatus.prototype.maxItems = function() {
    return $gameParty.size();
  };

  Window_MenuStatus.prototype.numVisibleRows = function() {
    return 4;
  };

  Window_MenuStatus.prototype.drawActorHp = function(actor, x, y, width, gaugeX) {
    width = width || 100;
    const color1 = ColorManager.hpGaugeColor1();
    const color2 = ColorManager.hpGaugeColor2();
    this.drawGauge(gaugeX, y, width, actor.hpRate(), color1, color2);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.hpA, x, y, 36);
    this.drawCurrentAndMax(actor.hp, actor.mhp, gaugeX, y, width, 
      ColorManager.hpColor(actor), ColorManager.normalColor());
  };

  Window_MenuStatus.prototype.drawActorMp = function(actor, x, y, width, gaugeX) {
    width = width || 100;
    const color1 = ColorManager.mpGaugeColor1();
    const color2 = ColorManager.mpGaugeColor2();
    this.drawGauge(gaugeX, y, width, actor.mpRate(), color1, color2);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.mpA, x, y, 36);
    this.drawCurrentAndMax(actor.mp, actor.mmp, gaugeX, y, width, 
      ColorManager.mpColor(), ColorManager.normalColor());
  };

  Window_MenuStatus.prototype.drawActorTp = function(actor, x, y, width, gaugeX) {
    width = width || 100;
    const color1 = ColorManager.tpGaugeColor1();
    const color2 = ColorManager.tpGaugeColor2();
    this.drawGauge(gaugeX, y, width, actor.tpRate(), color1, color2);
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.tpA, x, y, 36);
    this.changeTextColor(ColorManager.tpColor());
    this.drawText(actor.tp, gaugeX + width - 48, y, 48, "right");
  };

  Window_MenuStatus.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    const gaugeY = y + this.lineHeight() - 8;
    const fillW = Math.floor(width * rate);
    const gaugeH = 6;
    this.contents.fillRect(x, gaugeY, width, gaugeH, ColorManager.gaugeBackColor());
    this.contents.gradientFillRect(x, gaugeY, fillW, gaugeH, color1, color2);
  };

  Window_MenuStatus.prototype.drawCurrentAndMax = function(current, max, x, y, width, color1, color2) {
    const valueWidth = this.textWidth("0000");
    const slashWidth = this.textWidth("/");
    const x1 = x + width - valueWidth;
    const x2 = x1 - slashWidth - valueWidth;
    this.changeTextColor(color1);
    this.drawText(current, x2, y, valueWidth, "right");
    this.changeTextColor(ColorManager.normalColor());
    this.drawText("/", x2 + valueWidth, y, slashWidth);
    this.changeTextColor(color2);
    this.drawText(max, x1, y, valueWidth, "right");
  };
})();