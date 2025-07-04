//=============================================================================
// StopMovement.js
//=============================================================================

/*:
 * @plugindesc Stops player/NPC movement based on switches.
 * @author Jackkel Dragon
 *
 * @param PC Switch ID
 * @desc The ID of the switch that stops player movement.
 * @default -1
 *
 * @param NPC Switch ID
 * @desc The ID of the switch that stops NPC movement.
 * @default -1
 *
 * @help This plugin does not provide plugin commands.
 */
(function() {
    var parameters = PluginManager.parameters('StopMovement');
    var PCswitchId = Number(parameters['PC Switch ID'] || -1);
    var NPCswitchId = Number(parameters['NPC Switch ID'] || -1);
    var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        if ($gameSwitches.value(PCswitchId))
            return;
        _Game_Player_moveByInput.call(this);
    }
    var _Game_Event_updateSelfMovement = Game_Event.prototype.updateSelfMovement;
    Game_Event.prototype.updateSelfMovement = function() {
        if ($gameSwitches.value(NPCswitchId))
            return;
        _Game_Event_updateSelfMovement.call(this);
    }
})();