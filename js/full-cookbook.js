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
		for(let i = 0; i < entry.goalRank; i++) {
			updateMaterials(operator.promoMats[i]);
		}

		for (let i = 1; i <= entry.skillLevelGoal; i++) {
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

	function buildStatCard(title, opName, min, max, currentVal = 0, goalVal = 0) {
		const htmlTitle = title.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
		const html = 
			`<div id="${opName}-${htmlTitle}" class="stats-card">
				<p>${title}</p>
				<label>Current</label>
				<input type="number" min="${min}" max="${max}" value="${currentVal}"/>
				<br>
				<label>Goal </label>
				<input type="number" min="${min}" max="${max}" value="${goalVal}"/>
			</div>`;
		return html;
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
		for(let i = entry.rank; i < entry.goalRank; i++) {
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

		html += buildStatCard('Elite Rank', operatorName, 0, 2, entry.rank, entry.goalRank);
		html += buildStatCard('Level', operatorName, 1, entry.getMaxLevel(entry.rank), entry.level, entry.goalLevel);
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
			let rank = parseInt($(spinner.target).val());
			if (isNaN(rank) || rank > parseInt(spinner.target.max)) {
				return;
			}
			else if (entry.rank <= entry.goalRank) {
				updateRecipeFromRank(entry, entry.rank, rank)
				entry.rank = rank;
				saveSettings();
			}

		});

		$(`#${htmlName}-elite-rank input:eq(1)`).change((spinner) => {
			let rank = parseInt($(spinner.target).val());
			if (isNaN(rank) || rank > parseInt(spinner.target.max)) {
				return;
			}
			else if (entry.goalRank >= entry.rank) {
				const maxLevel = entry.getMaxLevel(rank);
				
				$(`#${htmlName}-level input:eq(1)`).attr('max', maxLevel);
				$(`#${htmlName}-level input:eq(1)`).val(maxLevel);

				entry.goalLevel = maxLevel;
				updateRecipeFromRank(entry, entry.goalRank, rank, -1);
				entry.goalRank = rank;
				saveSettings();
			}
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
			else if (entry.skillLevel <= entry.skillLevelGoal){
				updateRecipeFromSkillLv(operatorName, entry.skillLevel, level);
				entry.skillLevel = level;
				saveSettings();
				// Update goals here
			}
		});

		$(`#${htmlName}-skill-level input:eq(1)`).change((spinner) => {
			let level = parseInt($(spinner.target).val());
			if (isNaN(level) || level > spinner.target.max) {
				return;
			}
			else if (entry.skillLevelGoal >= entry.skillLevel){
				updateRecipeFromSkillLv(operatorName, level, entry.skillLevelGoal);
				entry.skillLevelGoal = level;
				saveSettings();
			}
		});

		for (let idx = 0; idx < numSkills; idx++) {
			const opSkillName = skillUpgradeDb[operatorName].names[idx];
			const htmlName = opSkillName.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
			const skillIdxBase = (idx + 1) * 10;

			$(`#${operatorName}-${htmlName} input:eq(0)`).change((spinner) => {
				console.log(entry.skillMasteryGoals[idx], entry.skillMastery[idx])
				let level = parseInt($(spinner.target).val());
				if (isNaN(level) || level > spinner.target.max) {
					return;
				}
				let toLevel = level + skillIdxBase;
				let fromLevel = entry.skillMastery[idx] + skillIdxBase;
				updateRecipeFromSkillLv(operatorName, fromLevel, toLevel);
				entry.skillMastery[idx] = level;
				saveSettings();
				recipeModule.update();
			});

			$(`#${operatorName}-${htmlName} input:eq(1)`).change((spinner) => {
				console.log(entry.skillMasteryGoals[idx], entry.skillMastery[idx])
				let level = parseInt($(spinner.target).val());
				if (isNaN(level) || level > spinner.target.max) {
					return;
				}
				let toLevel = level + skillIdxBase;
				let fromLevel = entry.skillMasteryGoals[idx] + skillIdxBase
				updateRecipeFromSkillLv(operatorName, fromLevel, toLevel, -1);
				entry.skillMasteryGoals[idx] = level;
				saveSettings();
				recipeModule.update();
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
				
				selectedOperatorList[operatorName] = new OperatorEntry(filteredOps[0], operatorEntry.level, operatorEntry.rank);
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

