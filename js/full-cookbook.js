"use strict";

let OperatorListFullModule = function () {

	let selectedOperatorList = {};
	let recipeModule;

	function init(inRecipeModule) {
		recipeModule = inRecipeModule;
		setTimeout(() => {
			loadSettings();
			recipeModule.load();
			recipeModule.update();
		}, 0);
		
		$('#ignoreRecipeMatsCheckbox').change(() => {
			setTimeout(refreshRecipeList, 0);
		});
	}

	function refreshRecipeList() {
		recipeModule.clear();
		for(const name in selectedOperatorList) {
			const entry = selectedOperatorList[name];
			fillOperatorRecipe(entry);
		}
		recipeModule.update();
	}

	function fillOperatorRecipe(entry) {
		const operator = entry.operator;
		for(let i = entry.currentRank; i < entry.goalRank; i++) {
			updateMaterials(operator.promoMats[i]);
		}

		for (let i = entry.skillLevel; i <= entry.skillLevelGoal; i++) {
			updateMaterials(skillUpgradeDb[operator.name].recipes[i]);
		}

		for (let i = 0; i < entry.skillMastery.length; i++) {
			for(let j = entry.skillMastery[i]; j <= entry.skillMasteryGoals[i]; j++ ) {
				const index = ((i + 1) * 10) + j
				updateMaterials(skillUpgradeDb[operator.name].recipes[index]);
			}
		}
		setTimeout(recipeModule.update, 0);
	}

	function addOperatorToList(entry) {
		const operator = entry.operator;
		if(operator.name in selectedOperatorList == true) {
			return;
		}
		selectedOperatorList[operator.name] = entry;

		/* HTML things to add */
		buildOperatorCard(entry);

		/* Ingredients to add */
		fillOperatorRecipe(entry);

		saveSettings();
	}

	function removeOperatorFromList(operator) {
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operator.name.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');
		$(`tr#${htmlName}SelectedRow`).remove();
		
		/* Ingredients to remove */
		const entry = selectedOperatorList[operator.name];
		for(let i = entry.currentRank; i < entry.goalRank; i++) {
			updateMaterials(operator.promoMats[i], -1);
		}

		for (let i = entry.skillLevel; i <= entry.skillLevelGoal; i++) {
			updateMaterials(skillUpgradeDb[operator.name].recipes[i], -1);
		}

		for (let i = 0; i < entry.skillMastery.length; i++) {
			for(let j = entry.skillMastery[i]; j <= entry.skillMasteryGoals[i]; j++ ) {
				const index = ((i + 1) * 10) + j
				updateMaterials(skillUpgradeDb[operator.name].recipes[index], -1);
			}
		}
		delete selectedOperatorList[operator.name];
		saveSettings();
		recipeModule.save();
		recipeModule.update();
	}

	function buildStatCard(title, opName, min, max, currentVal = 0, goalVal = 0) {
		const htmlTitle = title.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
		currentVal = (currentVal < goalVal) ? currentVal : goalVal;
		const html = 
			`<div id="${opName}-${htmlTitle}" class="stats-card">
				<p>${title}</p>
				<label>Current</label>
				<input type="number" min="${min}" max="${goalVal}" value="${currentVal}"/>
				<br>
				<label>Goal </label>
				<input type="number" min="${min}" max="${max}" value="${goalVal}"/>
			</div>`;
		return html;
	}

	function buildOperatorCard(entry) {
		const operatorName = entry.operator.name
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

		html += buildStatCard('Elite Rank', operatorName, 0, 2, entry.currentRank, entry.goalRank);
		html += buildStatCard('Level', operatorName, 1, entry.getMaxLevel(entry.currentRank), entry.level, entry.goalLevel);
		html += `
			</div></div>
				<div class="col-sm-8">
					<label>Skill Growth</label>
					<div style="display: flex; flex-direction: row;">`
		html += buildStatCard('Skill Level', operatorName, 1, 7, entry.skillLevel, entry.skillLevelGoal);
		
		let numSkills = 0;
		if (operatorName in skillUpgradeDb) {
			const skillNames = skillUpgradeDb[operatorName].names;
			numSkills = skillNames.length;
			for (let idx = 0; idx < numSkills; idx++) {
				const skillMasteryVal = entry.skillMastery[idx];
				const skillMasteryGoalVal = entry.skillMasteryGoals[idx];
				html += buildStatCard(skillUpgradeDb[operatorName].names[idx], operatorName, 0, 3, skillMasteryVal, skillMasteryGoalVal);
			}
		}
		html += `</div></div>`

		$(`#operators-list`).append(html);

		$($(`#${divId}`).children()[1]).hide();

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
			let newRank = parseInt($(spinner.target).val());
			if (isNaN(newRank) || newRank > parseInt(spinner.target.max)) {
				return;
			}

			updateRecipeFromRank(entry, entry.currentRank, newRank);
			entry.currentRank = newRank;
			saveSettings();
		});

		$(`#${htmlName}-elite-rank input:eq(1)`).change((spinner) => {
			let newRank = parseInt($(spinner.target).val());
			if (isNaN(newRank) || newRank > parseInt(spinner.target.max)) {
				return;
			}
			const maxLevel = entry.getMaxLevel(newRank);
			$(`#${htmlName}-level input:eq(1)`).attr('max', maxLevel);
			$(`#${htmlName}-level input:eq(1)`).val(maxLevel);

			$(`#${htmlName}-elite-rank input:eq(0)`).attr('max', newRank);

			if (newRank < entry.currentRank) {
				$(`#${htmlName}-elite-rank input:eq(0)`).val(newRank);
				entry.currentRank = newRank;
			}
			else {
				updateRecipeFromRank(entry, entry.goalRank, newRank, -1);
			}

			entry.goalLevel = maxLevel;
			entry.goalRank = newRank;
			saveSettings();
		});

		$(`#${htmlName}-level input:eq(0)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else {
				entry.level = level;
				saveSettings();
				// Update the goals here
			}
		});

		$(`#${htmlName}-level input:eq(1)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else {
				entry.goalLevel = level;
				saveSettings();
				// Update the goals here
			}
		});

		$(`#${htmlName}-skill-level input:eq(0)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			updateRecipeFromSkillLv(operatorName, entry.skillLevel, level);
			entry.skillLevel = level;
			saveSettings();
		});

		$(`#${htmlName}-skill-level input:eq(1)`).change((spinner) => {
			let newLevel = parseInt($(spinner.target).val());
			if (isNaN(newLevel) || newLevel > spinner.target.max) {
				return;
			}
			$(`#${htmlName}-skill-level input:eq(0)`).attr('max', newLevel);

			if (newLevel < entry.skillLevel) {
				$(`#${htmlName}-skill-level input:eq(0)`).val(newLevel);
				entry.skillLevel = newLevel;
			}
			else {
				updateRecipeFromSkillLv(operatorName, newLevel, entry.skillLevelGoal);
			}

			entry.skillLevelGoal = newLevel;
			saveSettings();
		});

		for (let idx = 0; idx < numSkills; idx++) {
			const opSkillName = skillUpgradeDb[operatorName].names[idx];
			const htmlName = opSkillName.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
			const skillIdxBase = (idx + 1) * 10;

			$(`#${operatorName}-${htmlName} input:eq(0)`).change((spinner) => {
				let newLevel = parseInt($(spinner.target).val());
				if (isNaN(newLevel) || newLevel > spinner.target.max) {
					return;
				}
				let toLevel = newLevel + skillIdxBase;
				let fromLevel = entry.skillMastery[idx] + skillIdxBase;
				updateRecipeFromSkillLv(operatorName, fromLevel, toLevel);
				entry.skillMastery[idx] = newLevel;
				console.log('Setting skill mastery')
				saveSettings();
			});

			$(`#${operatorName}-${htmlName} input:eq(1)`).change((spinner) => {
				let newLevel = parseInt($(spinner.target).val());
				if (isNaN(newLevel) || newLevel > spinner.target.max) {
					return;
				}
				let toLevel = newLevel + skillIdxBase;
				let fromLevel = entry.skillMasteryGoals[idx] + skillIdxBase
				$(`#${operatorName}-${htmlName} input:eq(0)`).attr('max', newLevel);

				if (newLevel < entry.skillMastery[idx]) {
					$(`#${operatorName}-${htmlName} input:eq(0)`).val(newLevel);
					entry.skillMastery[idx] = newLevel;
				}
				else {
					updateRecipeFromSkillLv(operatorName, fromLevel, toLevel, -1);
				}

				entry.skillMasteryGoals[idx] = newLevel;
				saveSettings();
			});
		}
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

	function updateRecipeFromRank(operatorEntry, fromRank, toRank, multiplier=1) {
		if (fromRank > toRank) {
			for(let i = fromRank - 1; i >= toRank; i--) {
				updateMaterials(operatorEntry.operator.promoMats[i], 1 * multiplier);
			}
		} 
		else {
			for(let i = fromRank; i < toRank; i++) {
				updateMaterials(operatorEntry.operator.promoMats[i], -1 * multiplier);
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
		$(`#operators-list`).empty();
		selectedOperatorList = {};
		localStorage.removeItem('arknightsRecipeOperators');
	}

	function saveSettings() {
		localStorage.setItem('arknightsRecipeOperators', JSON.stringify(selectedOperatorList));
	}

	function loadSettings() {
		let storedOperators = JSON.parse(localStorage.getItem('arknightsRecipeOperators'));
		if (storedOperators !== null) {
			for(const operatorName in storedOperators) {
				const operatorEntry = storedOperators[operatorName];
				let filteredOps = operatorList.filter(operator => {
					let nameSearchRegex = new RegExp(`^${operatorName}$`, 'i');
					return nameSearchRegex.test(operator.name);
				})
				
				selectedOperatorList[operatorName] = new OperatorEntry(filteredOps[0], operatorEntry.level, operatorEntry.currentRank);
				selectedOperatorList[operatorName].updateStats(operatorEntry)
				buildOperatorCard(selectedOperatorList[operatorName]);
				fillOperatorRecipe(selectedOperatorList[operatorName]);
			}
		}
	}

	return {
		init: init,
		add: addOperatorToList,
		remove: removeOperatorFromList,
		clear: clearAll,
		sort: sortList,
		getOperators: () => {return selectedOperatorList},
		getMaterialList: () => {return materialList}
	}
}();

