"use strict";

let fullCookbook = function () {
	let selectedOperatorList = {};
	let materialList = {};

	function init() {
		for (let matTierNum = 1; matTierNum <= 5; matTierNum++) {
			$(`#recipeTable`).append(`<tbody id="tier${matTierNum}MatsList"></tbody>`);
		}
		$(`#recipeTable`).append(`<tbody id="ChipList"></tbody>`);
		$(`#recipeTable`).append(`<tbody id="ChipPackList"></tbody>`);
		$(`#recipeTable`).append(`<tbody id="DualchipList"></tbody>`);

		$('#ignoreRecipeMatsCheckbox').change(() => {
			switchRecipeList();
		})
	
		$('#deleteAllDataBtn').click(() => {
			$('#allRarityBtn').click();
			$('#allClassesBtn').click();
			clearRecipeList();
			localStorage.removeItem('arknightsRecipeOperators');
			localStorage.removeItem('arknightsRecipeMaterials');
			localStorage.removeItem('arknightsRecipeGui');
		});
	}

	function clearRecipeList() {
		selectedOperatorList = {};
		for (const materialName in upgradeMaterials) {
			materialList[materialName] = new MaterialEntry();
		}
		for (let matTierNum = 1; matTierNum <= 5; matTierNum++) {
			const htmlName = `tier${matTierNum}MatsList`
			$(`#${htmlName}`).html('');
		}
		$('#selectedOpsTable > tbody').html('');
		$('#ChipList').html('');
		$('#ChipPackList').html('');
		$('#DualchipList').html('');
	}

	function loadSettings() {

	}

	function saveSettings() {

	}

	function addOperatorToList(operator) {
		if(operator.name in selectedOperatorList == true) {
			return;
		}
		/* HTML things to add */
		selectedOperatorList[operator.name] = new OperatorEntry(operator, 1, 0);
		buildSelectedOperatorList(operator.name);

		/* Ingredients to add */
		// for (const material in operator.e1_mats) {
		// 	updateMaterialRecipeList(material, operator.e1_mats[material]);
		// }

		// for (const material in operator.e2_mats) {
		// 	updateMaterialRecipeList(material, operator.e2_mats[material]);
		// }

		// updateGoals(selectedOperatorList[operator.name]);
		// updateRecipeList();
	}

	function removeOperatorFromList(operator) {
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operator.name.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');
		$(`tr#${htmlName}SelectedRow`).remove();
		delete selectedOperatorList[operator.name];

		// for (const material in operator.e2_mats) {
		// 	updateMaterialRecipeList(material, -operator.e2_mats[material]);
		// }

		// for (const material in operator.e1_mats) {
		// 	updateMaterialRecipeList(material, -operator.e1_mats[material]);
		// }

		// updateRecipeList();
	}

	function buildStatCard(title, opName, currentMax, goalMax, current=0, goal=0) {
		let htmlTitle = title.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
		let html = 
			`<div id="${opName}-${htmlTitle}" class="stats-card">
				<p>${title}</p>
				<label>Current</label>
				<input type="number" min="0" max="${currentMax}" value="${current}">
				<br>
				<label>Goal </label>
				<input type="number" min="0" max="${goalMax}" value="${goal}">
			</div>`;

		return html;
	}

	function buildSelectedOperatorList(operatorName) {
		let entry = selectedOperatorList[operatorName];

		if (!entry || entry.operator.rarity > 7) {
			return;
		}

		const rarityBackgrounds = ['#FFF', '#FFF', '#E1FF00', '#26A4FF', '#CBBAFF', '#FFE97F', '#F88E18' ]
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operatorName.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');

		let iconName = getIconName(operatorName);
		let rarityBackground = rarityBackgrounds[entry.operator.rarity];
		let gamePressName = operatorName.toLowerCase().replace(/'| the|\./g, '').replaceAll(' ', '-');

		let html = 
			`<div id="${htmlName}-card" class="container-fluid op-entry-card">
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

		html += buildStatCard('Elite Rank', operatorName, 2, 2, 0, 2);
		html += buildStatCard('Level', operatorName, entry.getMaxLevel(0), entry.getMaxLevel(0), 0, entry.getMaxLevel(0));
		html += `
			</div></div>
				<div class="col-sm-8">
					<label>Skill Growth</label>
					<div style="display: flex; flex-direction: row;">`
		html += buildStatCard('Skill Level', operatorName, 7, 7);
		
		const skillNames = skillUpgradeDb[operatorName].names;
		const numSkills = skillNames.length;
		for (let idx = 0; idx < numSkills; idx++) {
			html += buildStatCard(skillUpgradeDb[operatorName].names[idx], operatorName, 3, 3);
		}
		html += `</div></div>`

		$(`#operators-list`).append(html);
		$($(`#${htmlName}-card`).children()[1]).toggle();

		$($(`#${htmlName}-card`)[0].children[0]).click(() => {
			$($(`#${htmlName}-card`).children()[1]).toggle();
		})

		$($(`#${htmlName}-card`).children()[0].children[1].children[0]).click(event => {
			$(`#${htmlName}-card`).remove();
			delete selectedOperatorList[operatorName];
			event.stopPropagation();
		})

		// Adjust spinners
		const currentRank = $($(`#${operatorName}-elite-rank input`)[0])
		const goalRank = $($(`#${operatorName}-elite-rank input`)[1])

		currentRank.change(() => {
			let rank = parseInt(currentRank.val());
			if (isNaN(rank) || rank > currentRank[0].max) {
				return;
			}
			else if (rank > entry.goalRank) {
				currentRank.val(entry.goalRank);
			}
			else {
				entry.rank = rank
				// Update the goals here
			}
		})

		$(goalRank).change(() => {
			let rank = parseInt(goalRank.val());
			if (isNaN(rank) || rank > goalRank[0].max) {
				return;
			}
			else {
				entry.goalRank = rank
				if (entry.rank > rank) {
					entry.rank = rank;
					currentRank.val(rank);
				}
				// Update the goals here
			}
		})

		const currentLevel = $($(`#${operatorName}-level input`)[0])
		const goalLevel = $($(`#${operatorName}-level input`)[1])
		$(currentLevel).change(() => {
			let level = parseInt(currentLevel.val());
			if (isNaN(level) || level > currentLevel[0].max) {
				return;
			}
			else if (level > entry.goalLevel) {
				currentLevel.val(entry.goalLevel);
			}
			else {
				entry.level = level
				// Update the goals here
			}
		})

		$(goalLevel).change(() => {
			let level = parseInt(goalLevel.val());
			if (isNaN(level) || level > goalLevel[0].max) {
				return;
			}
			else {
				entry.goalLevel = level
				if (entry.level > level) {
					entry.level = level;
					currentLevel.val(level);
				}
				// Update the goals here
			}
		})

		// $(`input#${htmlName}CurrentLevelSpinner`).change(() => {
		// 	entry.level = parseInt($(`input#${htmlName}CurrentLevelSpinner`).val());
		// 	// updateGoals(entry);
		// });

		// $(`input#${htmlName}GoalLevelSpinner`).change(() => {
		// 	entry.goalLevel = parseInt($(`input#${htmlName}GoalLevelSpinner`).val());
		// 	// updateGoals(entry);
		// });

		// $(`input#${htmlName}CurrentRankSpinner`).change(() => {
		// 	const nextRank = parseInt($(`input#${htmlName}CurrentRankSpinner`).val());
		// 	if (entry.rank != nextRank) {
		// 		const maxLevel = entry.getMaxLevel(nextRank);
		// 		const currentLevelSpinner = $(`input#${htmlName}CurrentLevelSpinner`);
		// 		currentLevelSpinner.attr('max', maxLevel);
		// 		currentLevelSpinner.val(1);
		// 		// updateMaterialsList(entry.rank, nextRank, entry.operator);
		// 		entry.rank = nextRank;
		// 		entry.level = 1;
		// 		// updateGoals(entry);
		// 	}

		// });

		// $(`input#${htmlName}GoalRankSpinner`).change(() => {
		// 	const nextRank = parseInt($(`input#${htmlName}GoalRankSpinner`).val());
		// 	if (entry.goalRank != nextRank) {
		// 		const maxLevel = entry.getMaxLevel(nextRank);
		// 		const goalLevelSpinner = $(`input#${htmlName}GoalLevelSpinner`);
		// 		goalLevelSpinner.attr('max', maxLevel);
		// 		goalLevelSpinner.val(maxLevel);
		// 		updateMaterialsList_GoalRank(entry.goalRank, nextRank, entry.operator);
		// 		entry.goalRank = nextRank;
		// 		entry.goalLevel = maxLevel;
		// 		updateGoals(entry);
		// 	}
		// });
	}

	function clearAll() {

	}

	return {
		init: init,
		add: addOperatorToList,
		remove: removeOperatorFromList,
		clear: clearAll
	}
}();