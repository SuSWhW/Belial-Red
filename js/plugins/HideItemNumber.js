//===================================================================
//HideItemNumber.js
//任意のアイテムの個数を非表示にするプラグイン
//===================================================================
//Copyright (c) 2018 蔦森くいな
//Released under the MIT license.
//http://opensource.org/licenses/mit-license.php
//-------------------------------------------------------------------
//blog   : http://paradre.com/
//Twitter: https://twitter.com/Kuina_T
//===================================================================
//＜更新情報＞
//　ver1.0.1 2018/02/25 エラー落ち対策
//　ver1.0.0 2017/07/07 初版
//===================================================================

/*:
 * @plugindesc アイテムの個数を任意の条件で非表示にします。
 * @author 蔦森くいな
 *
 * @help データベースに登録した各アイテムの「メモ」欄に
 * 「個数非表示」もしくは「HideItemNumber」と入力すると
 * そのアイテムの個数が非表示になります。
 * 
 * また、つづけて以下のパラメータを入力すると条件設定ができます。
 * 
 * [スイッチ番号]
 * 指定した番号のスイッチがＯＮの時に個数を非表示にします。
 * 
 * [one]
 * アイテムを１つしか持っていない時に個数を非表示にします。
 * 
 * 例）
 * 個数非表示[1]
 * と入力するとスイッチ１番がＯＮの時に個数を非表示にします。
 * 
 * なお、プラグイン管理画面からパラメータ「Default_All」に
 * 上記と同様にコマンドを入力する事で、全てのアイテムに一括で
 * デフォルト設定を適用する事ができます。
 * 
 * デフォルト設定を適用していても各アイテムの個別設定が優先されます。
 * 各アイテムのメモ欄にコマンド以外の文字列が入力されていた場合、
 * そのアイテムの非表示設定は解除されます。
 * 
 * @param Default_All
 * @desc 全てのアイテムの個数非表示設定のデフォルト値。「個数非表示」「個数非表示[スイッチ番号]」「個数非表示[one]」
 * 
 * @param ForceSetDefault
 * @desc 「1」を入力すると各アイテムのメモ欄の内容に関わらずデフォルト設定を適用します。
 * @default 0
 * 
 *
 * 利用規約：
 * このプラグインは商用・非商用を問わず無料でご利用いただけます。
 * どのようなゲームに使っても、どのように加工していただいても構いません。
 * MIT Licenseにつき著作権表示とライセンスURLは残しておいて下さい。
 */

(function() {
    'use strict';
    
    var pd_HIN_DefaultAll = PluginManager.parameters("HideItemNumber")["Default_All"];
    var pd_HIN_ForceDefault = PluginManager.parameters("HideItemNumber")["ForceSetDefault"];
    
    var pd_HIN_Game_Temp_initialize = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
        
        pd_HIN_Game_Temp_initialize.call(this);
        this._pd_HIN_HideItemNum = false;
    };
    
    var pd_HIN_Window_ItemList_drawItem = Window_ItemList.prototype.drawItem;
    Window_ItemList.prototype.drawItem = function(index) {
        this.pd_HIN_checkHide(index);
        
        pd_HIN_Window_ItemList_drawItem.call(this, index);
        
        $gameTemp._pd_HIN_HideItemNum = false;
    };
    
    Window_ItemList.prototype.pd_HIN_checkHide = function(index){
        var item = this._data[index];
        if(!item) return;
        var commandList = [];
        
        if(pd_HIN_ForceDefault === '1' && pd_HIN_DefaultAll){
            commandList = pd_HIN_DefaultAll.toLowerCase().split(']');
        }
        else if(item.note !== ''){
            commandList = item.note.toLowerCase().split(']');
        }
        else if(pd_HIN_DefaultAll){
            commandList = pd_HIN_DefaultAll.toLowerCase().split(']');
        }
        
        var indexOf = -1;
        var hideSwitchNum = '';
        
        for(var i = 0; i < commandList.length; i++){
            var commandLength = 0;
            indexOf = commandList[i].indexOf('hideitemnumber');
            if(indexOf !== -1){
                commandLength = 14;
            }else{
                indexOf = commandList[i].indexOf('個数非表示');
                if(indexOf !== -1) commandLength = 5;
            }
            
            if(commandLength !== 0){
                if(commandList[i].contains('[')){
                    hideSwitchNum = commandList[i].slice(indexOf + commandLength + 1);
                }
                break;
            }
        }
        if(indexOf !== -1){
            if(hideSwitchNum === 'one'){
                if($gameParty.numItems(item) > 1){
                    return;
                }
            }
            else if(hideSwitchNum !== '' && !$gameSwitches.value(hideSwitchNum)){
                return;
            }
            $gameTemp._pd_HIN_HideItemNum = true;
        }
    }
    
    Window_ItemList.prototype.drawItemName = function(item, x, y, width) {
        if($gameTemp._pd_HIN_HideItemNum){
            Window_Base.prototype.drawItemName.call(this, item, x, y, width + this.numberWidth());
        }else{
            Window_Base.prototype.drawItemName.call(this, item, x, y, width);
        }
        
    };
    
    var pd_HIN_Window_ItemList_drawItemNumber = Window_ItemList.prototype.drawItemNumber;
    Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
        if(!$gameTemp._pd_HIN_HideItemNum){
            pd_HIN_Window_ItemList_drawItemNumber.call(this, item, x, y, width);
        }
    };
    
})();