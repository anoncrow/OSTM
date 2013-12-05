function loadSkills() {
	var skills = {
		'attack': new AttackSkillDef({
			displayName: 'Attack',
			baseDamage: 100,
			levelDamage: 5,
			level: 1
		}),
		'power-attack': new AttackSkillDef({
			displayName: 'Power Attack',
			keyCode: '1',
			scalingBase: {
				strength: 1
			},
			manaCost: 8,
			baseDamage: 150,
			levelDamage: 25
		}),
		'quick-attack': new AttackSkillDef({
			displayName: 'Quick Attack',
			keyCode: '2',
			scalingBase: {
				dexterity: 2.5
			},
			manaCost: 7,
			baseDamage: 140,
			levelDamage: 20
		}),

		'magic-missile': new SpellSkillDef({
			displayName: 'Magic Missile',
			keyCode: '3',
			scalingBase: {
				intelligence: 5
			},
			manaCost: 4,
			baseDamage: 80,
			levelDamage: 10
		}),
		'fireBolt': new SpellSkillDef({
			keyCode: '4',
			displayName: 'Fire Bolt',
			scalingBase: {
				intelligence: 10
			},
			manaCost: 11,
			baseDamage: 160,
			levelDamage: 20
		}),
		'fireball': new SpellSkillDef({
			displayName: 'Fireball',
			keyCode: '5',
			scalingBase: {
				intelligence: 6.5
			},
			manaCost: 20,
			baseDamage: 110,
			levelDamage: 15,
			doAttack: function(enemy) {
				var pos = enemy.getAbsolutePosition();
				var siz = 250;
				var jit = 32;
				var rangeLo = 0.2;
				var rangeHi = 0.6;
				var dmgHi = 0.6;
				var dmgLo = 0.25;
				ParticleContainer.createEffect('Explosion.png', {
					x: pos.x + (pos.w - siz) / 2 + randIntInc(-jit, jit),
					y: pos.y + (pos.h - siz) / 2 + randIntInc(-jit, jit),
					w: siz,
					h: siz,
				});

				enemy.takeDamage(Player.getDamageInfo());
				for (var i = EnemyManager.activeEnemies.length - 1; i >= 0; i--) {
					var e = EnemyManager.activeEnemies[i];
					if (e != enemy) {
						var d = distance(enemy.x, enemy.y, e.x, e.y);
						var dmg = lerp((d - rangeLo) / (rangeHi - rangeLo), dmgHi, dmgLo);
						e.takeDamage(Player.getDamageInfo(dmg));
					}
				}
			}
		}),
		'chainLightning': new SpellSkillDef({
			displayName: 'Chain Lightning',
			keyCode: '6',
			scalingBase: {
				intelligence: 7.5
			},
			manaCost: 14,
			baseDamage: 100,
			levelDamage: 10,
			doAttack: function() {
				var w = 50;
				var stepMult = 0.85;

				var makeArc = function(from, to) {
					var jit = 16;
					var fPos = from.getAbsolutePosition();
					var tPos = to.getAbsolutePosition();
					fPos.x += fPos.w / 2 + randIntInc(-jit, jit);
					fPos.y += fPos.h / 2 + randIntInc(-jit, jit);
					tPos.x += tPos.w / 2 + randIntInc(-jit, jit);
					tPos.y += tPos.h / 2 + randIntInc(-jit, jit);

					var d = vecDistance(fPos, tPos);

					ParticleContainer.createEffect('Lightning.png', {
						x: (fPos.x + tPos.x - w) / 2,
						y: (fPos.y + tPos.y - d) / 2,
						w: w,
						h: d,
						deg: 90 + 180 / Math.PI * Math.atan2(tPos.y - fPos.y, tPos.x - fPos.x),
						fadeTime: 250
					});
				};

				var damage = function(e, hitSet, dmg) {
					var closest = null;
					var minDist = 0;
					foreach (EnemyManager.activeEnemies, function(en) {
						if (hitSet.indexOf(en) === -1) {
							var d = distance(e.x, e.y, en.x, en.y);
							if (!closest || d < minDist) {
								closest = en;
								minDist = d;
							}
						}
					});

					if (closest) {
						makeArc(e, closest);
						damage(closest, hitSet.concat(closest), dmg * stepMult);
					}

					e.takeDamage(Player.getDamageInfo(dmg));
				};

				return function(enemy) {
					damage(enemy, [enemy], 1);
				};
			}()
		}),



		'health-up': new PassiveSkillDef({
			displayName: 'Health Plus',
			description: 'Increases Max Health by <mult.maxHealth>%',
			statMult: {
				maxHealth: {
					base: 10,
					level: 5
				}
			}
		}),
		'health-scale': new PassiveSkillDef({
			displayName: 'Health Mastery',
			description: 'Increases Max Health by <mult.healthPerLevel>% per Player Level',
			statMult: {
				healthPerLevel: {
					base: 0.05,
					level: 0.01
				}
			}
		}),
		'fortitude': new PassiveSkillDef({
			displayName: 'Fortitude',
			description: 'Increases overall Health Regen by <mult.healthRegen>%',
			statMult: {
				healthRegen: {
					base: 20,
					level: 5
				}
			}
		}),
		'heartiness': new PassiveSkillDef({
			displayName: 'Heartiness',
			description: 'Restores Health by <base.healthRegen>% of Max Health every second',
			statBase: {
				healthRegen: {
					base: 1,
					level: 0.1
				}
			}
		}),
		'mana-up': new PassiveSkillDef({
			displayName: 'Mana Plus',
			description: 'Increases Max Mana by <mult.maxMana>%',
			statMult: {
				maxMana: {
					base: 12,
					level: 6
				}
			}
		}),
		'focus': new PassiveSkillDef({
			displayName: 'Focus',
			description: 'Increases overall Mana Regen by <mult.manaRegen>%',
			statMult: {
				manaRegen: {
					base: 25,
					level: 6
				}
			}
		}),
		'crystal-mind': new PassiveSkillDef({
			displayName: 'Crystal Mind',
			description: 'Restores Mana by <base.manaRegen>% of Max Mana every second',
			statBase: {
				manaRegen: {
					base: 1.5,
					level: 0.15
				}
			}
		}),
		'precision': new PassiveSkillDef({
			displayName: 'Precision',
			description: 'Increase weapon base Crit Chance by <base.crit>%',
			statBase: {
				crit: {
					base: 1,
					level: 0.1
				}
			}
		}),
		'cruelty': new PassiveSkillDef({
			displayName: 'Cruelty',
			description: 'Adds <base.critDamage>% Crit Damage and increases all Damage by <mult.damage>%',
			statBase: {
				critDamage: {
					base: 20,
					level: 4
				}
			},
			statMult: {
				damage: {
					level: 1
				}
			}
		}),
		'power': new PassiveSkillDef({
			displayName: 'Power',
			description: 'Increases Damage and Spell Power by <mult.damage>%',
			statMult: {
				damage: {
					base: 1,
					level: 1
				},
				spellPower: {
					base: 1,
					level: 1
				}
			}
		}),
		'alchemy': new PassiveSkillDef({
			displayName: 'Alchemy',
			description: 'Increases item effectiveness by <mult.itemEffeciency>%',
			statMult: {
				itemEffeciency: {
					base: 100,
					level: 25
				}
			}
		}),
	};

	foreach (skills, function(skill, key) {
		skill.name = key;
	});
	return skills;
}
