Scene_Map.prototype.createButtons = function() { };
Scene_Battle.prototype.createButtons = function() { };


Game_Player.prototype.moveByInput = function () {
    if (!this.isMoving() && this.canMove()) {
        var direction = this.getInputDirection();
        if (direction > 0) {
            $gameTemp.clearDestination();
            this.executeMove(direction);
        }
    }
};

Sprite_Destination.prototype.update = function () {}


Game_Player.prototype.triggerAction = function () {
    if (this.canMove()) {
        if (this.triggerButtonAction()) {
            return true;
        }
    }
    return false;
};

Game_Player.prototype.triggerButtonAction = function () {
    if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
        if (this.getOnOffVehicle()) {
            return true;
        }
        this.checkEventTriggerHere([0]);
        if ($gameMap.setupStartingEvent()) {
            return true;
        }
        this.checkEventTriggerThere([0, 1, 2]);
        if ($gameMap.setupStartingEvent()) {
            return true;
        }
    }
    return false;
};


Game_Character.prototype.moveTowardPlayer = function() {
    const d = this.findDirectionTo($gamePlayer.x, $gamePlayer.y)
    this.moveStraight(d);
};

Game_Event.prototype.searchLimit = function() {
    return 9999;
};



