//==============================================================================
// dsUnsharedLearningSkill.js
// Copyright (c) 2015 - 2017 Douraku
// Released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//==============================================================================

/*:
 * @plugindesc 職業間で習得したスキルを共有しないプラグイン ver1.3.0
 * @author 道楽
 *
 * @param Include Skill Type
 * @desc 対象スキルのスキルタイプが使用できるならスキルを共有するか？
 * (true なら共有する / false なら共有しない)
 * @default false
 *
 * @param Other Class Learn
 * @desc 他の職業が習得した非共有スキルを習得するか？
 * (true なら習得する / false なら習得しない)
 * @default false
 *
 * @help
 * このプラグインは以下のメモタグの設定ができます。
 *
 * -----------------------------------------------------------------------------
 * スキルに設定するメモタグ
 *
 * <sharedSkill>
 *  このスキルは職業間で共有されるようになります。
 */

var Imported = Imported || {};
Imported.dsUnsharedLearningSkill = true;

(function (exports) {
	'use strict';

	exports.Param = (function() {
		var ret = {};
		var parameters = PluginManager.parameters('dsUnsharedLearningSkill');
		ret.IncludeSkillType = Boolean(parameters['Include Skill Type'] === 'true' || false);
		ret.OtherClassLearn = Boolean(parameters['Other Class Learn'] === 'true' || false);
		return ret;
	})();

	//--------------------------------------------------------------------------
	/** Game_BattlerBase */
	Game_BattlerBase.prototype.usableSkillTypes = function(skillType)
	{
		return this.addedSkillTypes().contains(skillType);
	};

	//--------------------------------------------------------------------------
	/** Game_Actor */
	var _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
	Game_Actor.prototype.initMembers = function()
	{
		_Game_Actor_initMembers.call(this);
		this._unsharedSkills = {};
	};

	var _Game_Actor_changeClass = Game_Actor.prototype.changeClass;
	Game_Actor.prototype.changeClass = function(classId, keepExp)
	{
		this.saveUnsharedSkills(this._classId);
		this.loadUnsharedSkills(classId);
		_Game_Actor_changeClass.call(this, classId, keepExp);
		if ( !this._unsharedSkills[classId] )
		{
			this.initUnsharedSkills();
		}
	};

	Game_Actor.prototype.initUnsharedSkills = function()
	{
		this.currentClass().learnings.forEach(function(learning) {
			if ( learning.level <= this._level )
			{
				this.learnSkill(learning.skillId);
			}
		}, this);
	};

	Game_Actor.prototype.learnUnsharedSkill = function(classId, skillId)
	{
		if ( !$dataSkills[skillId].meta.sharedSkill )
		{
			if ( !this._unsharedSkills[classId] )
			{
				this._unsharedSkills[classId] = [];
			}
			if ( !this._unsharedSkills[classId].contains(skillId) )
			{
				this._unsharedSkills[classId].push(skillId);
				this._unsharedSkills[classId].sort(function(a, b) {
					return a - b;
				});
			}
		}
	};

	Game_Actor.prototype.saveUnsharedSkills = function(classId)
	{
		var list = [];
		this._skills.forEach(function(id) {
			if ( !$dataSkills[id].meta.sharedSkill )
			{
				list.push(id);
			}
		});
		this._unsharedSkills[classId] = list;
	};

	Game_Actor.prototype.loadUnsharedSkills = function(classId)
	{
		var list = this._skills.filter(function(id) {
			return $dataSkills[id].meta.sharedSkill ? true : false;
		});
		if ( this._unsharedSkills[classId] )
		{
			this._unsharedSkills[classId].forEach(function(id) {
				if ( !list.contains(id) )
				{
					list.push(id);
				}
			});
		}
		this._skills = list;
		this._skills.sort(function(a, b) {
			return a - b;
		});
	};

	var _Game_Actor_learnSkill = Game_Actor.prototype.learnSkill;
	Game_Actor.prototype.learnSkill = function(skillId)
	{
		_Game_Actor_learnSkill.call(this, skillId);
		if ( exports.Param.OtherClassLearn )
		{
			if ( !$dataSkills[skillId].meta.sharedSkill )
			{
				$dataClasses.forEach(function(classData, idx) {
					if ( classData && classData.id != this._classId )
					{
						classData.learnings.forEach(function(learning) {
							if ( learning.skillId === skillId )
							{
								this.learnUnsharedSkill(classData.id, learning.skillId);
							}
						}, this);
					}
				}, this);
			}
		}
	};

	var _Game_Actor_skills = Game_Actor.prototype.skills;
	Game_Actor.prototype.skills = function()
	{
		var list = _Game_Actor_skills.call(this);
		if ( exports.Param.IncludeSkillType )
		{
			for ( var key in this._unsharedSkills )
			{
				this._unsharedSkills[key].forEach(function(id) {
					if ( this.usableSkillTypes($dataSkills[id].stypeId) )
					{
						if ( !list.contains($dataSkills[id]) )
						{
							list.push($dataSkills[id]);
						}
					}
				}, this);
			}
		}
		return list;
	};

	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------

	if ( Imported.YEP_ClassChangeCore )
	{
		Game_Actor.prototype.updateLearnedSkills = function(classId)
		{
			// 代わりにinitUnsharedSkillsで処理する
		};

	} // Imported.YEP_ClassChangeCore

	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------
	//--------------------------------------------------------------------------

	if ( Imported.YEP_SkillLearnSystem )
	{
		var _Game_Actor_learnSkill_YEP_SkillLearnSystem = Game_Actor.prototype.learnSkill;
		Game_Actor.prototype.learnSkill = function(skillId)
		{
			_Game_Actor_learnSkill_YEP_SkillLearnSystem.call(this, skillId);
			if ( exports.Param.OtherClassLearn )
			{
				if ( !$dataSkills[skillId].meta.sharedSkill )
				{
					$dataClasses.forEach(function(classData, idx) {
						if ( classData && classData.id != this._classId )
						{
							classData.learnSkills.forEach(function(learnSkillId) {
								if ( learnSkillId === skillId )
								{
									this.learnUnsharedSkill(classData.id, learnSkillId);
								}
							}, this);
						}
					}, this);
				}
			}
		};

	} // Imported.YEP_SkillLearnSystem

}((this.dsUnsharedLearningSkill = this.dsUnsharedLearningSkill || {})));
