"use strict";

let OperatorListFullModule = function () {

	let selectedOperatorList = {};
	let recipeModule;

	function init(inRecipeModule) {
		loadSettings();
		recipeModule = inRecipeModule;
	}

	function addOperatorToList(operator) {
		if(operator.name in selectedOperatorList == true) {
			return;
		}
		/* HTML things to add */
		selectedOperatorList[operator.name] = new OperatorEntry(operator, 1, 0);
		buildOperatorCard(operator.name);

		/* Ingredients to add */
		// updateMaterials(operator.e1_mats)
		// updateMaterials(operator.e2_mats)

		/* Adding ingredients from skills */
		for (let i = 3; i <= 7; i++) {
			// updateMaterials(skillUpgradeDb[operator.name].recipes[i]);
		}
		// updateGoals(selectedOperatorList[operator.name]);
		// updateRecipeList();
		recipeModule.update();
	}

	function removeOperatorFromList(operator) {
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operator.name.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');
		$(`tr#${htmlName}SelectedRow`).remove();
		
		console.log(`Removing materials from operator ${operator.name}`)
		
		let operatorEntry = selectedOperatorList[operator.name];
		if (operatorEntry.rank == 2) {
			updateMaterials(operator.e2_mats, -1);
		}
		if (operatorEntry.rank == 1) {
			updateMaterials(operator.e1_mats, -1);
		}
		updateRecipeFromSkillLv(operator.name, operatorEntry.skillLevel, 3);
		for(let i = 0; i < 3; i++) {
			updateRecipeFromSkillLv(operator.name, operatorEntry.skillMastery[i], 0)
		}
		recipeModule.update();
		delete selectedOperatorList[operator.name];
	}

	function buildStatCard(title, opName, min, max, useMinAsVal=false) {
		const htmlTitle = title.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
		const value = (useMinAsVal) ? min : max;
		const html = 
			`<div id="${opName}-${htmlTitle}" class="stats-card">
				<p>${title}</p>
				<label>Current</label>
				<input type="number" min="${min}" max="${max}" value="${min}"/>
				<br>
				<label>Goal </label>
				<input type="number" min="${min}" max="${max}" value="${value}"/>
			</div>`;
		return html;
	}

	function buildOperatorCard(operatorName) {
		let entry = selectedOperatorList[operatorName];

		if (!entry || entry.operator.rarity > 7) {
			return;
		}

		const rarityBackgrounds = ['#FFF', '#FFF', '#E1FF00', '#26A4FF', '#CBBAFF', '#FFE97F', '#F88E18' ]
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operatorName.replaceAll(' ', '-').replaceAll("'",'-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');

		let iconName = getIconName(operatorName);
		let rarityBackground = rarityBackgrounds[entry.operator.rarity];
		let gamePressName = operatorName.toLowerCase().replace(/'| the|\./g, '').replaceAll(' ', '-');
		const divId = `${entry.operator.rarity}-${htmlName}-card`

		let html = 
			`<div id="${divId}" class="container-fluid op-entry-card">
				<div class="row gx-1 justify-content op-entry-row op-card-header">
					<div class="col-10 inner-flexbox" >
						<div class="materialIcon" style="background-image: url('${opIconsPath}${iconName}_icon.webp'); background-color: ${rarityBackground}"></div>
						<div style="width: 160px;">${operatorName}<br>${entry.operator.getRarity_toString()}</div>
						<div style="width: 120px;"><img src="${classIconsPath}${entry.operator.getClass_toString()}.webp" alt="" height="48px">${entry.operator.getClass_toString()}</div>
						<div>
							<a href="https://arknights.fandom.com/wiki/${operatorName}" target="_blank" title="Fandom Wiki Page">
							<img src="./img/fandom_wiki_logo.png" width="24px">
							</a>
							<a href="https://gamepress.gg/arknights/operator/${gamePressName}" target="_blank" title="Gamepress Page">
							<img src="./img/gamepress_logo.png" width="24px">
							</a>
						</div>
					</div>
					<div class="col-2">
						<button type="button" class="btn btn-sm btn-danger" style="float:right;">X</button>
					</div>
				</div>
				<div class="row justify-content op-entry-row op-card-content">
					<div class="col-sm-4">
					<label>Experience Growth</label>
					<div style="display: flex; flex-direction: row;">`

		html += buildStatCard('Elite Rank', operatorName, 0, 2);
		html += buildStatCard('Level', operatorName, 1, entry.getMaxLevel(0));
		html += `
			</div></div>
				<div class="col-sm-8">
					<label>Skill Growth</label>
					<div style="display: flex; flex-direction: row;">`
		html += buildStatCard('Skill Level', operatorName, 1, 7);
		
		let numSkills = 0;
		if (operatorName in skillUpgradeDb) {
			const skillNames = skillUpgradeDb[operatorName].names;
			numSkills = skillNames.length;
			for (let idx = 0; idx < numSkills; idx++) {
				html += buildStatCard(skillUpgradeDb[operatorName].names[idx], operatorName, 0, 3, true);
			}
		}
		html += `</div></div>`

		$(`#operators-list`).append(html);


		$($(`#${divId}`).children()[1]).toggle();

		// Add event handlers
		$($(`#${divId} .row .col-2 button`)).click(() => {
			removeOperatorFromList(entry.operator);
		})
		$($(`#${divId}`).children()[0]).click(() => {
			$($(`#${divId}`).children()[1]).toggle();
		})

		$($(`#${divId}`).children()[0].children[1].children[0]).click(event => {
			$(`#${divId}`).remove();
			delete selectedOperatorList[operatorName];
			event.stopPropagation();
		})

		// Adjust spinners
		$(`#${htmlName}-elite-rank input:eq(0)`).change((spinner) => {
			let rank = parseInt($(spinner.target).val());
			if (isNaN(rank) || rank > parseInt(spinner.target.max)) {
				return;
			}
			else if (entry.rank <= entry.goalRank) {
				updateRecipeFromRank(entry, entry.rank, rank, -1)
			}
			entry.rank = rank;

		});

		$(`#${htmlName}-elite-rank input:eq(1)`).change((spinner) => {
			let rank = parseInt($(spinner.target).val());
			if (isNaN(rank) || rank > parseInt(spinner.target.max)) {
				return;
			}
			else if (entry.goalRank >= entry.rank) {
				updateRecipeFromRank(entry, entry.goalRank, rank)
			}
			entry.goalRank = rank
		});

		$(`#${htmlName}-level input:eq(0)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else {
				entry.level = level
				// Update the goals here
			}
		});

		$(`#${htmlName}-level input:eq(1)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else {
				entry.goalLevel = level
				// Update the goals here
			}
		});

		$(`#${htmlName}-skill-level input:eq(0)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else {
				updateRecipeFromSkillLv(operatorName, entry.skillLevel, level);
				entry.skillLevel = level;
				// Update goals here
			}
		});

		$(`#${htmlName}-skill-level input:eq(1)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else {
				updateRecipeFromSkillLv(operatorName, level, entry.skillLevelGoal);
				entry.skillLevelGoal = level;
			}
		});

		for (let idx = 0; idx < numSkills; idx++) {
			const opSkillName = skillUpgradeDb[operatorName].names[idx];
			const htmlName = opSkillName.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
			const skillIdxBase = (idx + 1) * 10;

			entry.skillMastery[skillIdxBase] = 0;
			entry.skillMasteryGoals[skillIdxBase] = 0;
			$(`#${operatorName}-${htmlName} input:eq(0)`).change((spinner) => {
				let level = parseInt($(spinner.target).val());
				if (isNaN(level) || level > spinner.target.max) {
					return;
				}
				else {
					let toLevel = level + skillIdxBase;
					let fromLevel = entry.skillMastery[skillIdxBase] + skillIdxBase
					updateRecipeFromSkillLv(operatorName, fromLevel, toLevel);
					entry.skillMastery[skillIdxBase] = level;
				}
			});

			$(`#${operatorName}-${htmlName} input:eq(1)`).change((spinner) => {
				let level = parseInt($(spinner.target).val());
				if (isNaN(level) || level > spinner.target.max) {
					return;
				}
				else {
					let toLevel = level + skillIdxBase;
					let fromLevel = entry.skillMasteryGoals[skillIdxBase] + skillIdxBase
					updateRecipeFromSkillLv(operatorName, fromLevel, toLevel, -1);
					entry.skillMasteryGoals[skillIdxBase] = level;
				}
			});
		}
		sortList();
	}

	function updateRecipeFromSkillLv(operatorName, fromLevel, toLevel, multiplier=1) {
		if (fromLevel > toLevel) {
			for(let i = fromLevel; i > toLevel; i--) {
				updateMaterials(skillUpgradeDb[operatorName].recipes[i], 1 * multiplier);
			}
		} 
		else {
			for(let i = fromLevel + 1; i <= toLevel; i++) {
				updateMaterials(skillUpgradeDb[operatorName].recipes[i], -1 * multiplier);
			}
		}
		recipeModule.update();
	}

	function updateRecipeFromRank(operatorEntry, oldRank, newRank, multiplier=1) {
		if (oldRank == 0) {
			if (newRank > 0) {
				updateMaterials(operatorEntry.operator.e1_mats, multiplier);
			}
			if (newRank == 2) {
				updateMaterials(operatorEntry.operator.e2_mats, multiplier);
			}
		}
		else if (oldRank == 1) {
			if (newRank == 0) {
				updateMaterials(operatorEntry.operator.e1_mats, -multiplier)
			}
			if (newRank == 2) {
				updateMaterials(operatorEntry.operator.e2_mats, multiplier)
			}
		}
		else if (oldRank == 2) {
			if (newRank < 2) {
				updateMaterials(operatorEntry.operator.e2_mats, -multiplier)
			}
			if (newRank == 0) {
				updateMaterials(operatorEntry.operator.e1_mats, -multiplier)
			}
		} 
		recipeModule.update();
	}

	function updateMaterials(materials, multiplier=1) {
		for (const material in materials) {
			recipeModule.add(material, materials[material] * multiplier);
		}
	}

	function sortList() {
		let sortedOps = [];
		$('#operators-list div.op-entry-card').sort(function(a, b) {
			return a.id.localeCompare(b.id);
		}).each(function() {
			sortedOps.push($(this).clone(true));
			$(this).remove();
		});

		sortedOps.forEach(opCard => {
			$('#operators-list').append(opCard)
		})
	}	

	function clearAll() {
		localStorage.removeItem('arknightsRecipeOperators');
	}

	function loadSettings() {
	}

	return {
		init: init,
		add: addOperatorToList,
		remove: removeOperatorFromList,
		clear: clearAll,
		getOperators: () => {return selectedOperatorList},
		getMaterialList: () => {return materialList}
	}
}();

