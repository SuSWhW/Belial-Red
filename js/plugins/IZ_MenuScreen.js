//=============================================================================
// IZ_MenuScreen.js
//=============================================================================

/*:
 * @plugindesc マップ名＆メモつきメニュー画面
 * @author いず
 *
 * @param ActorForInfo
 * @desc メモとしてプロファイルを表示するアクターのID
 * 適用されるのはプロファイルの１行目のみ（全角だと40文字まで）
 * @default 5
 *
 * @param bgBitmapMenu
 * @desc メニュー背景にするビットマップファイルのファイル名。
 * img/pictures に置いてください。
 * @default 
 *
 * @help ・表示アクター数を１減らす代わりに
 * 　マップ名と簡単なメモを表示するメニュー画面を作成します。
 *
 * ・ActorForInfoでIDを指定したアクターのプロファイルの１行目が
 * 　メモに適用されます。全角だと４０文字入ります。
 *
 * ・背景画像としてPNGファイルを１つ指定することができます。
 * 　プラグインパラメータでファイル名を指定してください。
 * 　画像は、img/pictures に置いてください。
 *
 */

(function() {

    // set parameters
    var parameters = PluginManager.parameters('IZ_MenuScreen');
    var bgBitmapMenu = parameters['bgBitmapMenu'] || '';
    var infoId = Number(parameters['ActorForInfo'] );


    //------------------------------------------------------------------------------------
    // MapNameウィンドウの設定
    //
    
    function Window_MapNameMenu() {
        this.initialize.apply(this, arguments);
    }

    Window_MapNameMenu.prototype = Object.create(Window_Base.prototype);
    Window_MapNameMenu.prototype.constructor = Window_MapNameMenu;

    Window_MapNameMenu.prototype.initialize = function () {
        var wight = this.windowWidth();
        var height = this.windowHeight();
        var x = 0;
        var y = this.windowY();
        Window_Base.prototype.initialize.call(this, x, y, wight, height);
        if (bgBitmapMenu) {
            this.opacity = 0;
        }
        this.refresh();
    };
    
    Window_MapNameMenu.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };
    
    Window_MapNameMenu.prototype.windowHeight = function () {
        return this.fittingHeight(1);
    };

    Window_MapNameMenu.prototype.windowY = function () {
        return 0;
    };
    
    Window_MapNameMenu.prototype.refresh = function () {
        this.contents.clear();

        if ($gameMap.displayName()) {
            var width = this.contentsWidth();
            this.drawText($gameMap.displayName(), 0, 0, width, 'center');
        }
    };

    Window_MapNameMenu.prototype.drawBackground = function (x, y, width, height) {
        var color1 = this.dimColor1();
        var color2 = this.dimColor2();
        this.contents.gradientFillRect(x, y, width / 2, height, color2, color1);
        this.contents.gradientFillRect(x + width / 2, y, width / 2, height, color1, color2);
    };


    //------------------------------------------------------------------------------------
    // Infoウィンドウの設定
    //

    function Window_Info() {
        this.initialize.apply(this, arguments);
    }

    Window_Info.prototype = Object.create(Window_Base.prototype);
    Window_Info.prototype.constructor = Window_Info;

    Window_Info.prototype.initialize = function () {
        var wight = this.windowWidth();
        var height = this.windowHeight();
        var x = 0;
        var y = Graphics.boxHeight - height;
        Window_Base.prototype.initialize.call(this, x, y, wight, height);
        if (bgBitmapMenu) {
            this.opacity = 0;
        }
        this.refresh();
    };

    Window_Info.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };
    
    Window_Info.prototype.windowHeight = function () {
        return Graphics.boxHeight - Window_MenuStatus.prototype.windowHeight() - Window_MenuStatus.prototype.windowY();/////
    };
    
    
    Window_Info.prototype.standardFontSize = function () {
        return 20;
    };
    

    Window_Info.prototype.refresh = function () {
        this.contents.clear();
        var width = this.contentsWidth();
        this.drawTextEx($gameActors.actor(infoId).profile(), 0, 4, 'left');
    };

    Window_Info.prototype.drawBackground = function (x, y, width, height) {
        var color1 = this.dimColor1();
        var color2 = this.dimColor2();
        this.contents.gradientFillRect(x, y, width / 2, height, color2, color1);
        this.contents.gradientFillRect(x + width / 2, y, width / 2, height, color1, color2);
    };


    //-------------------------------------------------------------------------------------------------
    // 各ウィンドウの配置
    //
    
    Scene_Menu.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createCommandWindow();
        this.createGoldWindow();
        this.createStatusWindow();
        this.createMapNameWindow2();
        this.createInfoWindow();
    };

    
    Scene_Menu.prototype.createMapNameWindow2 = function () {
        var wy = 20;
        var wh = 100;
        this._mapNameWindow2 = new Window_MapNameMenu(0, wy, Graphics.boxWidth - 180, wh);
        this.addWindow(this._mapNameWindow2);
    };

    Scene_Menu.prototype.createInfoWindow = function () {
        this._infoWindow = new Window_Info();
        this.addWindow(this._infoWindow);
    };
    
    
   
   //----------------------------------------------------------------------------------------
   // ウィンドウレイアウトの変更と各ウィンドウの透明化
    //

    var _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.call(this);
        this._commandWindow.y = this._mapNameWindow2.height;
        this._goldWindow.x = 0;//
        this._goldWindow.y = this._commandWindow.y + this._commandWindow.height;
        this._goldWindow.height = this._goldWindow.fittingHeight(1);
        this._goldWindow.width = this._commandWindow.width;
        this._statusWindow.y = this._commandWindow.y;
        // make transparent for all windows at menu scene.
        if (bgBitmapMenu) {
            this._statusWindow.opacity = 0;
            this._goldWindow.opacity = 0;
            this._commandWindow.opacity = 0;
        }
    };

    Scene_Menu.prototype.createCommandWindow = function () {
        this._commandWindow = new Window_MenuCommand(0, 0);
        var width = this._commandWindow.windowWidth();
        this._commandWindow.setHandler('item', this.commandItem.bind(this));
        this._commandWindow.setHandler('skill', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('equip', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('status', this.commandPersonal.bind(this));
        this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
        this._commandWindow.setHandler('options', this.commandOptions.bind(this));
        this._commandWindow.setHandler('save', this.commandSave.bind(this));
        this._commandWindow.setHandler('gameEnd', this.commandGameEnd.bind(this));
        this._commandWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._commandWindow);
    };


    //
    // 背景画像の読み込み
    //
    var _Scene_Menu_createBackground = Scene_Menu.prototype.createBackground;
    Scene_Menu.prototype.createBackground = function(){
        if(bgBitmapMenu){
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap =
             ImageManager.loadPicture(bgBitmapMenu);
            this.addChild(this._backgroundSprite);
            return;
        }
        // if background file is invalid, it does original process.
        _Scene_Menu_createBackground.call(this);
    };

    

    //------------------------------------------------------------------------------------------
    // ステータスウィンドウの調整
    //

    
    Window_MenuStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth - Window_MenuCommand.prototype.windowWidth();
    };
    
    Window_MenuStatus.prototype.windowHeight = function() {
        return 480;
    };

    Window_MenuStatus.prototype.windowX = function () {
        return Window_MenuCommand.prototype.windowWidth();
    }
    
    Window_MenuStatus.prototype.windowY = function(){
        return Window_MapNameMenu.prototype.windowHeight() + Window_MapNameMenu.prototype.windowY();
    }

    Window_MenuStatus.prototype.maxCols = function() {
        return 1;
    };

    Window_MenuStatus.prototype.numVisibleRows = function() {
        return 3;
    };
    
    
})();
