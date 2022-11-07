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

	loadSettings();
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
const RECIPE_TYPES = {
	ELITE_RANK: 1,
	SKILL_LVL: 2,
	S1_MASTERY: 10,
	S2_MASTERY: 20,
	S3_MASTERY: 30
}

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

function buildOperatorCard(operatorName, entry) {
	const rarityBackgrounds = ['#FFF', '#FFF', '#E1FF00', '#26A4FF', '#CBBAFF', '#FFE97F', '#F88E18' ]
	const operatorData = OPERATOR_DATA[operatorName];
	let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
	let htmlName = operatorName.replaceAll(' ', '-').replaceAll("'",'-');
	htmlName = htmlName.replaceAll(htmlNameRegex, '');

	let iconName = getIconName(operatorName);
	let rarityBackground = rarityBackgrounds[operatorData.rarity];
	let gamePressName = operatorName.toLowerCase().replace(/'| the|\./g, '').replaceAll(' ', '-');
	const divId = `${operatorData.rarity}-${htmlName}-card`

	let html = 
		`<div id="${divId}" class="container-fluid op-entry-card" style="background: #444; width: 720px;" data-sort="${operatorData.id}">
			<div class="row gx-1 justify-content op-entry-row op-card-header">
				<div class="col-10 inner-flexbox" >
					<div class="materialIconBase" style="background-image: url('${opIconsPath}${iconName}_icon.webp'); background-color: ${rarityBackground}"></div>
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
			<div style="background-color: #DDD; padding: 5px; color: #444;">
				<table id="${operatorData.rarity}-${htmlName}-goals-table" style="width: 100%;">
					<thead>
						<tr>
							<td></td>
							<td colspan="5" style="text-align: center;">Goals</td>
						</tr>
						<tr>
							<td>Current Level</td>`;

	if(operatorData.rarity >= 3) {
		html += `<td>Rank</td><td>Skill Level</td>`
	}
	if (operatorData.rarity >= 4) {
		html += `<td>S1 Mastery</td>`;
		html += `<td>S2 Mastery</td>`;
	}
	if (operatorData.rarity === 6){
		html += `<td>S3 Mastery</td>`;
	}
	html += `</tr></thead><tbody>`
	html += `<td><input type="number" min="1" max="${getMaxLevel(operatorData.rarity, 0)}" value="1"/></td>`

	if(operatorData.rarity >= 3) {
		html += `<td><input type="number" min="0" max="${getMaxRank(operatorData.rarity)}" value="${entry.goalRank}"/></td>`
		html += `<td><input type="number" min="1" max="7" value="${entry.skillLevelGoal}"/></td>`
	}
	
	if (operatorData.rarity >= 4) {
		html += `<td><input type="number" min="0" max="3" value="${entry.skillMasteryGoals[0]}"/></td>`
		html += `<td><input type="number" min="0" max="3" value="${entry.skillMasteryGoals[1]}"/></td>`
	}
	if (operatorData.rarity === 6){
		html += `<td><input type="number" min="0" max="3" value="${entry.skillMasteryGoals[2]}"/></td>`
	}
	html += `</tbody></table><hr>`
	const recipeTableId = `${operatorData.rarity}-${htmlName}-recipes`;

	html += `<table id="${recipeTableId}" style="width: 100%;"></table>`
	$(`#operators-list`).append(html);

	const goalSpinnersQuery = $(`#${divId} input[type=number]`);

	$($(`#${divId} .row .col-2 button`)).click(() => {
		$(`#${divId}`).remove();
		COOKBOOK_DATABASE.deleteOperator(operatorName);
		updateMaterialList();
	});

	$($(`#${divId}`).children()[0]).click(() => {
		$($(`#${divId}`).children()[1]).toggle();
	});
	
	/* Add elite rank handler */
	$(goalSpinnersQuery[1]).change((spinner) => {
		handleOpSpinner(spinner, operatorName, RECIPE_TYPES.ELITE_RANK);
	});

	/* Add skill level handler */
	$(goalSpinnersQuery[2]).change((spinner) => {
		handleOpSpinner(spinner, operatorName, RECIPE_TYPES.SKILL_LVL);
	});

	/* Add skill mastery handler */
	$(goalSpinnersQuery[3]).change((spinner) => {
		handleOpSpinner(spinner, operatorName, RECIPE_TYPES.S1_MASTERY);
	});

	$(goalSpinnersQuery[4]).change((spinner) => {
		handleOpSpinner(spinner, operatorName, RECIPE_TYPES.S2_MASTERY);
	});

	$(goalSpinnersQuery[5]).change((spinner) => {
		handleOpSpinner(spinner, operatorName, RECIPE_TYPES.S3_MASTERY);
	});

	/* Initialize with recipes */
	if (operatorData.rarity >= 3){
		updateOpCardRecipe(entry.goalRank, 0, operatorName, RECIPE_TYPES.ELITE_RANK);
	}
	if (operatorData.rarity >= 3) {
		updateOpCardRecipe(entry.skillLevelGoal, 1, operatorName, RECIPE_TYPES.SKILL_LVL);
	}
	if (operatorData.rarity >= 4) {
		updateOpCardRecipe(entry.skillMasteryGoals[0], 0, operatorName, RECIPE_TYPES.S1_MASTERY);
		updateOpCardRecipe(entry.skillMasteryGoals[1], 0, operatorName, RECIPE_TYPES.S2_MASTERY);
	}
	if (operatorData.rarity === 6){
		updateOpCardRecipe(entry.skillMasteryGoals[2], 0, operatorName, RECIPE_TYPES.S3_MASTERY);
	}

	$($(`#${divId}`).children()[1]).toggle();

	$('div#operators-list div.op-entry-card').sort(function (a, b) {
		let contentA =parseInt( $(a).data('sort'));
		let contentB =parseInt( $(b).data('sort'));
		return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
	 }).appendTo(`#operators-list`)
}

function handleOpSpinner(spinner, operatorName, type) {
	let entry = COOKBOOK_DATABASE.getOperator(operatorName);
	let newValue = parseInt($(spinner.target).val());
	let oldValue = parseInt(spinner.target.defaultValue);
	updateOpCardRecipe(newValue, oldValue, operatorName, type);
	spinner.target.defaultValue = newValue;

	let recipes = {};
	if (type === RECIPE_TYPES.ELITE_RANK) {
		entry.goalRank = newValue;
		recipes = OPERATOR_DATA[operatorName].promoMats;
	}
	else if (type === RECIPE_TYPES.SKILL_LVL) {
		entry.skillLevelGoal = newValue;
		recipes = SKILL_UPGRADES[operatorName].recipes;
	}
	else if (type >= RECIPE_TYPES.S1_MASTERY) {
		entry.skillMasteryGoals[(type/10) - 1] = newValue;
		oldValue += type;
		newValue += type;
		recipes = SKILL_UPGRADES[operatorName].recipes;
	}

	updateRecipeFromChange(newValue, oldValue, recipes);
	COOKBOOK_DATABASE.updateOperator(operatorName, entry);
}

function updateOpCardRecipe(newValue, oldValue, operatorName, type) {
	const htmlName = operatorName.replaceAll(' ', '-').replaceAll("'",'-');
	const operatorData = OPERATOR_DATA[operatorName];
	const recipeTableId = `${operatorData.rarity}-${htmlName}-recipes`;

	let idOffset = 0;

	if (type === RECIPE_TYPES.SKILL_LVL) { 
		idOffset = 10;
	}
	else if (type >= RECIPE_TYPES.S1_MASTERY) {
		idOffset = type * 10;
		newValue += type;
		oldValue += type;
	}
	if(oldValue < newValue) {
		let recipeName = '';
		let recipes = {};
		let skillSummaries = [];
		
		if (type === RECIPE_TYPES.ELITE_RANK) {
			recipeName = `Elite Rank `;
			recipes = operatorData.promoMats;
		}
		else if (type === RECIPE_TYPES.SKILL_LVL) { 
			skillSummaries = SKILL_SUMMARIES[operatorData.rarity];
			recipeName = `Skill Lv `;
			recipes = SKILL_UPGRADES[operatorName].recipes;
		}
		else if (type >= RECIPE_TYPES.S1_MASTERY) {
			skillSummaries = SKILL_SUMMARIES[operatorData.rarity];
			if (SKILL_UPGRADES[operatorName].names.length === 0) {
				recipeName = `S${type/10} Mastery `;
			}
			else {
				recipeName = `${SKILL_UPGRADES[operatorName].names[type/10 - 1]} Mastery `;
			}
			recipes = SKILL_UPGRADES[operatorName].recipes;
		}
		for (let i = oldValue + 1; i <= newValue; i++) {
			const recipeId = `${i + idOffset}-${htmlName}`
			let recipe = {};
			let recipeHtml = `<tr id="${recipeId}" data-sort="${i + idOffset}">`;

			if (type === RECIPE_TYPES.ELITE_RANK && operatorData.rarity >= 3) {
				recipe['LMD'] = RANK_PROMO_COST[operatorData.rarity][i - 1];
			}
			if (type === RECIPE_TYPES.SKILL_LVL && i < skillSummaries.length) {
				const numSummaries = skillSummaries[i];

				if (2 <= i && i <= 3) {
					recipe['Skill Summary 1'] = numSummaries;
				}
				else if (4 <= i && i <= 6) {
					recipe['Skill Summary 2'] = numSummaries;
				}
				else {
					recipe['Skill Summary 3'] = numSummaries;
				}
			}
			else if (type >= RECIPE_TYPES.S1_MASTERY && (i - type) < skillSummaries.length) {
				const numSummaries = skillSummaries[i - type + 7];
				recipe['Skill Summary 3'] = numSummaries;
			}
			Object.assign(recipe, recipes[i]);
			recipeHtml += buildRecipeRows(recipe, recipeName + `${i % 10}`, `${recipeId}`);
			recipeHtml += `</tr>`;
			$(`#${recipeTableId}`).append(recipeHtml);

			$(`#${recipeId}-checkbox`).click(testHandler);
			$(`#${recipeId}-checkbox-label`).click(testHandler);
		}
	}
	else if(oldValue > newValue){
		for (let i = oldValue; i > newValue; i--) {
			$(`#${i + idOffset}-${htmlName}`).remove();
		}
	}

	$(`table#${recipeTableId} tr`).sort(function (a, b) {
		let contentA =parseInt( $(a).data('sort'));
		let contentB =parseInt( $(b).data('sort'));
		return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
	 }).appendTo(`#${recipeTableId}`)
}

function buildRecipeRows(recipe, recipeName, idName) {
	let recipeHtml = `
		<td>
			<input type="checkbox" id="${idName}-checkbox">
			<label id="${idName}-checkbox-label" for="${idName}-checkbox">${recipeName}</label>
		</td>`
	for(const ingredientName in recipe) {
		recipeHtml += `<td>${recipe[ingredientName]}x</td>`
		recipeHtml += `<td>${createMaterialIconHtml(ingredientName, ICON_SIZE.SMALL)}</td>`
	}
	return recipeHtml;
}

function testHandler(event) {
	const recipeId = $(event.target.parentElement.parentElement).attr('id');
	const checkedValue = parseInt($(event.target.parentElement.parentElement).attr('data-sort'));
	const typeValue = Math.floor(checkedValue / 100);
	const checked = $(event.target).prop('checked');
	if(checked === true ) {
		$(event.target.parentElement.parentElement).addClass('listRowComplete');
	}
	else {
		$(event.target.parentElement.parentElement).removeClass('listRowComplete');
	}

	if (typeValue === 3) {
		// if (checked) {
		// 	for(let i = (checkedValue % 10) - 1; i > 0; i --) {
		// 		$(`#${recipeId}-checkbox`).prop('checked', true);
		// 	}
		// }
		console.log(`Checked value is skill mastery 3, level ${checkedValue % 10}`);
	}
	else if (typeValue === 2) {
		console.log(`Checked value is skill mastery 2, level ${checkedValue % 10}`);
	}
	else if (typeValue === 1) {
		console.log(`Checked value is skill mastery 1, level ${checkedValue % 10}`);
	}
	else if (typeValue === 0 && Math.floor(checkedValue / 10) === 1) {
		console.log(`Checked value is skill level ${checkedValue % 10}`);
	}
	else {
		console.log(`Checked value is for elite rank ${checkedValue % 10}`)
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
			if (Object.keys(recipes[i]).length === 0) {
				break;
			}
			addMaterials(recipes[i]);
		}
	} 
	else {
		for(let i = toValue; i > fromValue; i--) {
			if (Object.keys(recipes[i]).length === 0) {
				break;
			}
			addMaterials(recipes[i], -1);
		}
	}
}

/* Materials section *********************************************************/
const ICON_SIZE = {
	SMALL: 1,
	MEDIUM: 2,
	LARGE: 3
}
let displayedMaterials = new Set();

function createMaterialIconHtml(materialName, size=ICON_SIZE.MEDIUM) {
	const materialData = UPGRADE_MATERIALS[materialName];
	const tier = materialData.tier;
	const fileName = materialName.replaceAll(' ', '_');
	const matBackground = tierBackgroundColors[tier];
	let classes = "materialIconBase ";

	switch(size) {
		case ICON_SIZE.SMALL:
			classes += "materialIconSm";
			break;
		case ICON_SIZE.MEDIUM:
			classes += "materialIconMd";
			break;
		default:
			break;
	}

	let html = `<div class="${classes}" title="${materialName}" style="background-image: url('${matIconsPath}${fileName}.webp'); background-color: ${matBackground}"></div>`

	return html;
}

function buildMaterialRow(materialName) {
	const materialEntry = COOKBOOK_DATABASE.getMaterials(materialName)[materialName];

	if (materialEntry.recipeTotal === 0) {
		return;
	}
	
	const htmlName = materialName.replaceAll(' ', '');
	const materialData = UPGRADE_MATERIALS[materialName];
	const tier = materialData.tier;

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
			<td>${createMaterialIconHtml(materialName)}</td>
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
		},
	}

}();