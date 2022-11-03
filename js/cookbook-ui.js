"use strict";
const opIconsPath = `./img/op-icons/`;
const matIconsPath = `./img/mat-icons/`;
const classIconsPath = `./img/class-icons/`;

function getIconName(name) {
	name = name.replace(/ /g, '_');
	name = name.replace(/'/g, '');
	return name;
}

const UI_MODULE = function() {
/* General Hanlders **********************************************************/
function generalUiInit() {
	$(`#clearAllSelectedBtn`).click(() => {
		COOKBOOK_DATABASE.deleteAllOperators();
		$(`#operators-list`).empty();
		updateMaterialList();
	});
	$(`#deleteAllDataBtn`).click(() => {
		COOKBOOK_DATABASE.deleteAll();
		$(`#operators-list`).empty();
		updateMaterialList();
	});
}

/* Search Bar ****************************************************************/
const classNames = ['Caster', 'Defender', 'Guard', 'Medic', 'Sniper', 'Specialist', 'Supporter', 'Vanguard'];

function searchBarInit() {
	classNames.forEach(className => {
		const htmlName = className.toLowerCase();
		const html = `
			<div class="form-check form-check-inline search-checkbox">
				<input class="form-check-input" type="checkbox" value="" id="${htmlName}Checkbox" checked>
				<label class="form-check-label" for="${htmlName}Checkbox">
					<img src="${classIconsPath}${className}.webp" alt="" height="24px">
					${className}
				</label>
			</div>`
		$('#classFilterSection').append(html);
		$(`#${htmlName}Checkbox`).change(() => filterResults());
	});
	const allButtonHtml = `<br><button id="allClassesBtn" type="button" class="btn btn-sm btn-secondary">Select all</button>`

	$('#classFilterSection').append(allButtonHtml);
	$('#allClassesBtn').click(() => {
		classNames.forEach(className => {
			const htmlName = className.toLowerCase();
			$(`#${htmlName}Checkbox`).prop("checked", true);
		})
		filterResults();
	})

	for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
		const htmlName = `rarity${rarityNum}`;
		const stars = '★'.repeat(rarityNum);
		const html = `
			<div class="form-check form-check-inline search-checkbox">
				<input class="form-check-input" type="checkbox" value="" id="${htmlName}Checkbox" checked>
				<label class="form-check-label" for="${htmlName}Checkbox">
					${rarityNum} ${stars}
				</label>
			</div>`
		$('#rarityFilterSection').append(html);
		$(`#${htmlName}Checkbox`).change(() => {
			filterResults();
		})
	}
	$('#rarityFilterSection').append(`<br><button id="allRarityBtn" type="button" class="btn btn-sm btn-secondary">Select all</button>`);
	$('#allRarityBtn').click(() => {
		for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
			$(`#rarity${rarityNum}Checkbox`).prop("checked", true);
		}
		filterResults();
	})

	$('#name-input').keyup(() => {
		filterResults();
	});

	$('#toggleSearchBtn').click(() => {
		$('#searchContainer').toggle();
	})

	$(window).resize(() => {
		if ($(window).width() >= 992) {
			$('#searchContainer').show();
		}
	});

	filterResults();
}

function filterResults() {
	// Filter on names
	const searchStr = ($('#name-input').val().length > 0) ? $('#name-input').val() : `[\\s\\S]*`;
	const operatorNames = Object.keys(OPERATOR_DATA)
	let nameSearchRegex = new RegExp(`${searchStr}`, 'i');
	let filteredNames = operatorNames.filter(name => name.match(nameSearchRegex))

	// Filter on class
	let classFilter = 0;
	if ($('#casterCheckbox').prop('checked')) {
		classFilter |= CLASS.CASTER;
	}
	if ($('#defenderCheckbox').prop('checked')) {
		classFilter |= CLASS.DEFENDER;
	}
	if ($('#guardCheckbox').prop('checked')) {
		classFilter |= CLASS.GUARD;
	}
	if ($('#medicCheckbox').prop('checked')) {
		classFilter |= CLASS.MEDIC;
	}
	if ($('#sniperCheckbox').prop('checked')) {
		classFilter |= CLASS.SNIPER;
	}
	if ($('#specialistCheckbox').prop('checked')) {
		classFilter |= CLASS.SPECIALIST;
	}
	if ($('#supporterCheckbox').prop('checked')) {
		classFilter |= CLASS.SUPPORTER;
	}
	if ($('#vanguardCheckbox').prop('checked')) {
		classFilter |= CLASS.VANGUARD;
	}

	filteredNames = filteredNames.filter(name => {
		return (OPERATOR_DATA[name].opClass & classFilter) > 0
	});

	// Filter on rarity
	let rarityFitler = [];
	if ($('#rarity1Checkbox').prop('checked')) {
		rarityFitler.push(1);
	}
	if ($('#rarity2Checkbox').prop('checked')) {
		rarityFitler.push(2);
	}
	if ($('#rarity3Checkbox').prop('checked')) {
		rarityFitler.push(3);
	}
	if ($('#rarity4Checkbox').prop('checked')) {
		rarityFitler.push(4);
	}
	if ($('#rarity5Checkbox').prop('checked')) {
		rarityFitler.push(5);
	}
	if ($('#rarity6Checkbox').prop('checked')) {
		rarityFitler.push(6);
	}
	filteredNames = filteredNames.filter(name => {
		return (rarityFitler.indexOf(OPERATOR_DATA[name].rarity) > -1);
	});

	$('div#searchList').html('')
	filteredNames.forEach(createSearchListEntry);
	saveSettings();
}

function createSearchListEntry(operatorName) {
	const operatorData = OPERATOR_DATA[operatorName];
	let iconName = getIconName(operatorName);
	let html =
		`<div class="searchEntry">
			<div class="row">
				<div class="col-3">
					<img src="${opIconsPath}${iconName}_icon.webp" width="60px" />
				</div>
				<div class="col-9">
					<span>${operatorName}</span><br>
					<span>${operatorData.createRarityString()} ${operatorData.opClass_toString()}</span><br>
				</div>
			</div>
		</div>`

	$('div#searchList').append(html)
	$('div#searchList')[0].children[$('div#searchList')[0].children.length - 1].onclick = () => {
		const entry = COOKBOOK_DATABASE.createOperatorEntry(operatorName);
		if (entry !== null) {
			buildOperatorCard(operatorName, entry);
		}
		updateMaterialList();
	}
}

/* Selected operators section ************************************************/
function recipeSectionInit() {
	const savedNames = COOKBOOK_DATABASE.getNames();
	savedNames.forEach(opName => {
		const opEntry = COOKBOOK_DATABASE.getOperator(opName);
		buildOperatorCard(opName, opEntry);
	});

	for (let matTierNum = 1; matTierNum <= 5; matTierNum++) {
		$(`#recipeTable`).append(`<tbody id="tier${matTierNum}MatsList"></tbody>`);
	}
	$(`#recipeTable`).append(`<tbody id="ChipList"></tbody>`);
	$(`#recipeTable`).append(`<tbody id="ChipPackList"></tbody>`);
	$(`#recipeTable`).append(`<tbody id="DualchipList"></tbody>`);

	const savedMats = COOKBOOK_DATABASE.getMaterialList();
	for(const materialName in savedMats) {
		buildMaterialRow(materialName);
	}
	updateMaterialList();
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

function buildOperatorCard(operatorName, entry) {
	const rarityBackgrounds = ['#FFF', '#FFF', '#E1FF00', '#26A4FF', '#CBBAFF', '#FFE97F', '#F88E18' ]
	let operatorData = OPERATOR_DATA[operatorName];
	let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
	let htmlName = operatorName.replaceAll(' ', '-').replaceAll("'",'-');
	htmlName = htmlName.replaceAll(htmlNameRegex, '');
	operatorData.name = operatorName;

	let iconName = getIconName(operatorName);
	let rarityBackground = rarityBackgrounds[operatorData.rarity];
	let gamePressName = operatorName.toLowerCase().replace(/'| the|\./g, '').replaceAll(' ', '-');
	const divId = `${operatorData.rarity}-${htmlName}-card`

	let html = 
		`<div id="${divId}" class="container-fluid op-entry-card">
			<div class="row gx-1 justify-content op-entry-row op-card-header">
				<div class="col-10 inner-flexbox" >
					<div class="materialIcon" style="background-image: url('${opIconsPath}${iconName}_icon.webp'); background-color: ${rarityBackground}"></div>
					<div style="width: 160px;">${operatorName}<br>${operatorData.createRarityString()}</div>
					<div style="width: 120px;"><img src="${classIconsPath}${operatorData.opClass_toString()}.webp" alt="" height="48px">${operatorData.opClass_toString()}</div>
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
	html += buildStatCard('Level', operatorName, 1, getMaxLevel(entry.currentRank), entry.level, entry.goalLevel);
	html += `
		</div></div>
			<div class="col-sm-8">
				<label>Skill Growth</label>
				<div style="display: flex; flex-direction: row;">`
	html += buildStatCard('Skill Level', operatorName, 1, 7, entry.skillLevel, entry.skillLevelGoal);
	
	let numSkills = 0;
	if (operatorName in SKILL_UPGRADES) {
		const skillNames = SKILL_UPGRADES[operatorName].names;
		numSkills = skillNames.length;
		for (let idx = 0; idx < numSkills; idx++) {
			const skillMasteryVal = entry.skillMastery[idx];
			const skillMasteryGoalVal = entry.skillMasteryGoals[idx];
			html += buildStatCard(SKILL_UPGRADES[operatorName].names[idx], operatorName, 0, 3, skillMasteryVal, skillMasteryGoalVal);
		}
	}
	html += `</div></div>`

	$(`#operators-list`).append(html);

	/* Add event handlers */
	$($(`#${divId} .row .col-2 button`)).click(() => {
		$(`#${divId}`).remove();
		COOKBOOK_DATABASE.deleteOperator(operatorName);
		updateMaterialList();
	});

	$($(`#${divId}`).children()[0]).click(() => {
		$($(`#${divId}`).children()[1]).toggle();
	});

	/* Rank spinner handlers *************************************************/
	$(`#${htmlName}-elite-rank input:eq(0)`).change((spinner) => {
		let newRank = parseInt($(spinner.target).val());
		if (isNaN(newRank) || newRank > parseInt(spinner.target.max)) {
			return;
		}
		updateRecipeFromChange(entry.currentRank, newRank, OPERATOR_DATA[operatorName].promoMats);
		entry.currentRank = newRank;
		COOKBOOK_DATABASE.updateOperator(operatorName, entry);
	});

	$(`#${htmlName}-elite-rank input:eq(1)`).change((spinner) => {
		let newRank = parseInt($(spinner.target).val());
		if (isNaN(newRank) || newRank > parseInt(spinner.target.max)) {
			return;
		}
		const maxLevel = getMaxLevel(operatorData.rarity, newRank);
		$(`#${htmlName}-level input:eq(1)`).attr('max', maxLevel);
		$(`#${htmlName}-level input:eq(1)`).val(maxLevel);
		$(`#${htmlName}-elite-rank input:eq(0)`).attr('max', newRank);
		if (newRank < entry.currentRank) {
			$(`#${htmlName}-elite-rank input:eq(0)`).val(newRank);
			entry.currentRank = newRank;
		}
		else {
			updateRecipeFromChange(newRank, entry.goalRank, OPERATOR_DATA[operatorName].promoMats);
		}

		entry.goalLevel = maxLevel;
		entry.goalRank = newRank;
		COOKBOOK_DATABASE.updateOperator(operatorName, entry);
	});

	/* Skill spinner handlers ************************************************/
	$(`#${htmlName}-skill-level input:eq(0)`).change((spinner) => {
		let newLevel = parseInt($(spinner.target).val());
		if (isNaN(newLevel) || newLevel > spinner.target.max) {
			return;
		}
		updateRecipeFromChange(entry.skillLevel, newLevel, SKILL_UPGRADES[operatorName].recipes);
		entry.skillLevel = newLevel;
		COOKBOOK_DATABASE.updateOperator(operatorName, entry);
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
			updateRecipeFromChange(newLevel, entry.skillLevelGoal, SKILL_UPGRADES[operatorName].recipes);
		}
		entry.skillLevelGoal = newLevel;
		COOKBOOK_DATABASE.updateOperator(operatorName, entry);
	});

	/* Skill mastery spinner handlers ****************************************/
	for (let idx = 0; idx < numSkills; idx++) {
		const opSkillName = SKILL_UPGRADES[operatorName].names[idx];
		const htmlName = opSkillName.replaceAll(' ', '-').replaceAll('"','').toLowerCase();
		const skillIdxBase = (idx + 1) * 10;

		$(`#${operatorName}-${htmlName} input:eq(0)`).change((spinner) => {
			let newLevel = parseInt($(spinner.target).val());
			if (isNaN(newLevel) || newLevel > spinner.target.max) {
				return;
			}
			let toLevel = newLevel + skillIdxBase;
			let fromLevel = entry.skillMastery[idx] + skillIdxBase;
			updateRecipeFromChange(fromLevel, toLevel, SKILL_UPGRADES[operatorName].recipes);
			entry.skillMastery[idx] = newLevel;
			COOKBOOK_DATABASE.updateOperator(operatorName, entry);
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
				updateRecipeFromChange(toLevel, fromLevel, SKILL_UPGRADES[operatorName].recipes);
			}
			entry.skillMasteryGoals[idx] = newLevel;
			COOKBOOK_DATABASE.updateOperator(operatorName, entry);
		});
	}
}

function updateRecipeFromChange(fromValue, toValue, recipes) {
	function addMaterials(recipe, multiplier=1) {
		for (const ingredientName in recipe) {
			COOKBOOK_DATABASE.updateRecipe(ingredientName, recipe[ingredientName] * multiplier);
		}
		updateMaterialList();
	}

	if (fromValue > toValue) {
		for(let i = fromValue; i > toValue; i--) {
			addMaterials(recipes[i]);
		}
	} 
	else {
		for(let i = toValue; i > fromValue; i--) {
			addMaterials(recipes[i], -1);
		}
	}
}

/* Materials section *********************************************************/
let displayedMaterials = new Set();

function buildMaterialRow(materialName) {
	const materialEntry = COOKBOOK_DATABASE.getMaterials(materialName)[materialName];

	if (materialEntry.recipeTotal === 0) {
		return;
	}
	
	const materialData = UPGRADE_MATERIALS[materialName];
	const htmlName = materialName.replaceAll(' ', '');
	const fileName = materialName.replaceAll(' ', '_');
	const tier = materialData.tier;

	let matBackground = tierBackgroundColors[tier];
	let appendTo = '';
	let tierName = `${tier}`;

	if (tier < 100) {
		appendTo = `#tier${tier}MatsList`;
	} else {
		let chipPackWords = materialName.split(' ');
		chipPackWords.shift();
		tierName = chipPackWords.join(' ');
		appendTo = `#${chipPackWords.join('')}List`;
	}

	const matHtml =
		`<tr id="${htmlName}MatRow">
			<td><div class="materialIcon" style="background-image: url('${matIconsPath}${fileName}.webp'); background-color: ${matBackground}"></div></td>
			<td>${materialName}</td>
			<td>${tierName}</td>
			<td><input id="${htmlName}InventorySpinner" type="number" min="0" max="999" value="${materialEntry.inventory}">
			<td id="${htmlName}MatNeeded"></td>
		</tr>`;
	$(appendTo).append(matHtml);
	displayedMaterials.add(materialName);
	$(`input#${htmlName}InventorySpinner`).val(materialEntry.inventory);

	$(`input#${htmlName}InventorySpinner`).on("change", () => {
		const spinner = $(`input#${htmlName}InventorySpinner`)[0];
		const difference = spinner.value - materialEntry.inventory;
		COOKBOOK_DATABASE.updateInventory(materialName, difference);

		/* Update the row and check if things are craftable */
		updateMaterialRow(materialName, materialEntry);
		checkIfCraftable(materialName);

		const materialData = UPGRADE_MATERIALS[materialName];
		const nextTier = MATERIAL_TIER_INDEX[materialData.tier + 1];
		if (nextTier) {
			nextTier.forEach(checkIfCraftable);
		}
	})
}

function updateMaterialList() {
	let materialList = COOKBOOK_DATABASE.getMaterialList();

	displayedMaterials.forEach(materialName => {
		if (materialName in materialList === false) {
			const htmlName = materialName.replaceAll(' ', '');
			$(`#${htmlName}MatRow`).remove();
			displayedMaterials.delete(materialName);
		}
	})
	
	/* Check if the material is no longer needed in the recipe, add it if it's
	   not already in the list, update the values in the row, and check if
	   it's craftable */
	for(const materialName in materialList) {
		const htmlName = materialName.replaceAll(' ', '');
		const materialEntry = COOKBOOK_DATABASE.getMaterials(materialName)[materialName];
		if (materialEntry.recipeTotal === 0) {
			$(`#${htmlName}MatRow`).remove();
		}
		else {
			if ($(`tr#${htmlName}MatRow`).length === 0){
				buildMaterialRow(materialName);
			}
			updateMaterialRow(materialName, materialEntry);
			checkIfCraftable(materialName);
		}
	}
}

function checkIfCraftable(craftableName) {
	const htmlName = craftableName.replaceAll(' ', '');
	const craftableRecipe = UPGRADE_MATERIALS[craftableName].recipe;
	const craftableEntry = COOKBOOK_DATABASE.getMaterials(craftableName)[craftableName];
	
	if(!craftableEntry || Object.keys(craftableRecipe).length === 0) {
		return;
	}
	if (craftableEntry.needed > 0) {
		let metRequirements = 0;
		for(const ingredientName in craftableRecipe) {
			const needed = craftableRecipe[ingredientName] * craftableEntry.needed;
			const ingredientEntry = COOKBOOK_DATABASE.getMaterials(ingredientName)[ingredientName];
			if (ingredientEntry.inventory >= needed) {
				metRequirements ++;
			}
		}
		if (metRequirements === Object.keys(craftableRecipe).length) {
			$(`#${htmlName}MatRow`).removeClass('listRowComplete');
			$(`#${htmlName}MatRow`).addClass('listRowCanComplete');
		}
		else {
			$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
		}
	}
}

function updateMaterialRow(materialName, materialEntry) {
	const htmlName = materialName.replaceAll(' ', '');
	let needed = materialEntry.needed;
	needed = (needed < 0) ? 0 : needed;
	$(`td#${htmlName}MatNeeded`).html(`${needed} / ${materialEntry.recipeTotal}`);

	if (needed <= 0) {
		$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
		$(`#${htmlName}MatRow`).addClass('listRowComplete');
	}
	else {
		$(`#${htmlName}MatRow`).removeClass('listRowComplete');
	}

	const materialRecipe = UPGRADE_MATERIALS[materialName].recipe;
	for(const ingredientName in materialRecipe) {
		const ingredientEntry = COOKBOOK_DATABASE.getMaterials(ingredientName)[ingredientName];
		updateMaterialRow(ingredientName, ingredientEntry)
	}
}

/* Utility Functions *********************************************************/
function saveSettings() {
	let guiSettings = JSON.parse(localStorage.getItem('arknightsRecipeGui'));
	if (guiSettings === null) {
		guiSettings = {
			'lastNameSearched': $('#name-input').val(),
			'classesSelected': [],
			'raritySelected': [],
		}
	}
	else {
		guiSettings.classesSelected = [];
		guiSettings.raritySelected = [];
	}
	guiSettings.lastNameSearched = $('#name-input').val();

	classNames.forEach(className => {
		const htmlName = className.toLowerCase();
		guiSettings.classesSelected.push($(`#${htmlName}Checkbox`).prop('checked'));
	});

	for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
		const htmlName = `rarity${rarityNum}`;
		guiSettings.raritySelected.push($(`#${htmlName}Checkbox`).prop('checked'));
	}

	localStorage.setItem('arknightsRecipeGui', JSON.stringify(guiSettings));
}

function loadSettings() {
	let guiSettings = JSON.parse(localStorage.getItem('arknightsRecipeGui'));
	if (guiSettings !== null) {
		$('#name-input').val(guiSettings.lastNameSearched);

		for(let i = 0; i < guiSettings.classesSelected.length; i++) {
			const htmlName = classNames[i].toLowerCase();
			$(`#${htmlName}Checkbox`).prop('checked', guiSettings.classesSelected[i]);
		}

		for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
			const htmlName = `rarity${rarityNum}`;
			$(`#${htmlName}Checkbox`).prop('checked', guiSettings.raritySelected[rarityNum - 1]);
		}
	}
}

	return {
		init: () => {
			generalUiInit();
			searchBarInit();
			recipeSectionInit();
		}
	}

}();