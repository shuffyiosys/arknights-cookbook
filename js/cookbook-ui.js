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
		const operatorData = OPERATOR_DATA[operatorName];
		if (entry !== null) {
			entry.goalRank = getMaxRank(operatorData.rarity);
			entry.skillLevelGoal = 7;
			buildOperatorCard(operatorName, entry);
			COOKBOOK_DATABASE.updateOperator(operatorName, entry);
		}
		updateMaterialList();
	}
}

/* Selected operators section ************************************************/
const RECIPE_TYPES = {
	LEVEL_UP: 0,
	ELITE_RANK: 1,
	SKILL_LVL: 2,
	S1_MASTERY: 10,
	S2_MASTERY: 20,
	S3_MASTERY: 30
}

let ingredientsToRecipe = {};
let selectedRecipes = {};

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
	$(`#recipeTable`).append(`<tbody id="SkillSummaryList"></tbody>`);

	const savedMats = COOKBOOK_DATABASE.getMaterialList();
	for(const materialName in savedMats) {
		buildMaterialRow(materialName);
	}
	updateMaterialList();
}

function getOpHtmlName(operatorName) {
	const htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
	let htmlName = operatorName.replaceAll(' ', '-').replaceAll("'",'_');
	htmlName = htmlName.replaceAll(htmlNameRegex, '');
	return htmlName;
}

function buildOperatorCard(operatorName, entry) {
	const rarityBackgrounds = ['#FFF', '#FFF', '#E1FF00', '#26A4FF', '#CBBAFF', '#FFE97F', '#F88E18' ]
	const operatorData = OPERATOR_DATA[operatorName];
	let htmlName = getOpHtmlName(operatorName);
	let iconName = getIconName(operatorName);
	let rarityBackground = rarityBackgrounds[operatorData.rarity];
	let gamePressName = operatorName.toLowerCase().replace(/'| the|\./g, '').replaceAll(' ', '-');
	const divId = `${operatorData.rarity}-${htmlName}-card`;
	

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
			<div id="${htmlName}-card-info" style="background-color: #DDD; padding: 5px; color: #444;">
			</div>`;

	$(`#operators-list`).append(html);

	if(entry.finalized === false) {
		buildOpCardStats(operatorName, entry);
	}
	else {
		initOpRecipes(operatorName);
	}

	$($(`#${divId} .row .col-2 button`)).click(() => {
		const operatorEntry = COOKBOOK_DATABASE.getOperator(operatorName);
		selectedRecipes[operatorName].forEach(recipeId => {
			const operatorData = OPERATOR_DATA[operatorName];
			updateRecipe(operatorData.recipes[recipeId], -1);

			let recipe = {};
			if (recipeId >= 100) {
				recipe['LMD'] = RANK_PROMO_COST[operatorData.rarity][recipeId % 10 - 1];
			}
			else if (recipeId >= 10) {
				recipe['Skill Summary 3'] = operatorData.getSkillSummaryCount((recipeId% 10) + 7);
			}
			else {
				if (2 <= recipeId && recipeId <= 3) {
					recipe['Skill Summary 1'] = operatorData.getSkillSummaryCount(recipeId);
				}
				else if (4 <= recipeId && recipeId <= 6) {
					recipe['Skill Summary 2'] = operatorData.getSkillSummaryCount(recipeId);
				}
				else {
					recipe['Skill Summary 3'] = operatorData.getSkillSummaryCount(recipeId);
				}
			}
			updateRecipe(recipe, -1);
		})
		$(`#${divId}`).remove();
		COOKBOOK_DATABASE.deleteOperator(operatorName);
		delete selectedRecipes[operatorName];
	});

	$($(`#${divId}`).children()[0]).click(() => {
		$($(`#${divId}`).children()[1]).toggle();
	});

	$($(`#${divId}`).children()[1]).toggle();

	$('div#operators-list div.op-entry-card').sort(function (a, b) {
		let contentA =parseInt( $(a).data('sort'));
		let contentB =parseInt( $(b).data('sort'));
		return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
	 }).appendTo(`#operators-list`);
}

function buildOpCardStats(operatorName, entry) {
	const operatorData = OPERATOR_DATA[operatorName];
	const divId = `${operatorData.rarity}-${getOpHtmlName(operatorName)}-card`;
	const htmlName = getOpHtmlName(operatorName);

	let goalTableHeader = `<tr>`;
	let nowRowHtml = `<tr>`;
	let goalRowHtml = `<tr>`;

	goalTableHeader += `<td>Current Level</td><td></td>`;
	nowRowHtml += `<tr><td></td><td>Now:</td>`;
	goalRowHtml += `<td><input type="number" min="1" max="${getMaxLevel(operatorData.rarity, entry.goalRank)}" value="0" recipeType="0"/></td>`;
	goalRowHtml += `<td>Goal:</td>`;

	if(operatorData.rarity >= 3) {
		goalTableHeader += `<td>Rank</td><td>Skill Level</td>`
		nowRowHtml += `<td><input type="number" min="0" max="${getMaxRank(operatorData.rarity)}" value="${entry.rank}" recipeType="1"/></td>`;
		nowRowHtml += `<td><input type="number" min="1" max="7" value="${entry.skillLevel}" recipeType="2"/></td>`;

		goalRowHtml += `<td><input type="number" min="0" max="${getMaxRank(operatorData.rarity)}" value="${entry.goalRank}" recipeType="1"/></td>`
		goalRowHtml += `<td><input type="number" min="1" max="7" value="${entry.skillLevelGoal}" recipeType="2"/></td>`
	}
	
	if (operatorData.rarity >= 4) {
		goalTableHeader += `<td>${operatorData.skillNames[0]} Mastery</td>`;
		goalTableHeader += `<td>${operatorData.skillNames[1]} Mastery</td>`;

		nowRowHtml += `<td><input type="number" min="0" max="3" value="${entry.skillMastery[0]}" recipeType="10"/></td>`;
		nowRowHtml += `<td><input type="number" min="0" max="3" value="${entry.skillMastery[1]}" recipeType="20"/></td>`;

		goalRowHtml += `<td><input type="number" min="0" max="3" value="${entry.skillMasteryGoals[0]}" recipeType="10"/></td>`
		goalRowHtml += `<td><input type="number" min="0" max="3" value="${entry.skillMasteryGoals[1]}" recipeType="20"/></td>`
	}
	if (operatorData.rarity === 6){
		goalTableHeader += `<td>${operatorData.skillNames[2]} Mastery</td>`;
		nowRowHtml += `<td><input type="number" min="0" max="3" value="${entry.skillMastery[2]}" recipeType="30"/></td>`;
		goalRowHtml += `<td><input type="number" min="0" max="3" value="${entry.skillMasteryGoals[2]}" recipeType="30"/></td>`
	}
	goalTableHeader += `</tr>`;
	nowRowHtml += `</tr>`;
	goalRowHtml += `</tr>`;

	let html = `
			<table id="${operatorData.rarity}-${htmlName}-goals-table" style="width: 100%;">
				<thead>
					<tr>
						<td></td>
						<td colspan="5" style="text-align: center;">Goals</td>
					</tr>
					${goalTableHeader}
				<tbody>
					${nowRowHtml}
					${goalRowHtml}
				</tbody>
			</table>
		<button id="${htmlName}-CreateRecipeBtn" type="button" class="btn btn-sm btn-primary">Generate</button>
		`;
	$(`#${htmlName}-card-info`).append(html);

	/* Recipe generator */
	const opCardStatsQuery = $(`#${divId} input[type=number]`);
	$(`#${htmlName}-CreateRecipeBtn`).click((event) => {
		buildOpRecipes(operatorName, opCardStatsQuery);
		$(`#${operatorData.rarity}-${htmlName}-goals-table`).remove();
		$(event.target).remove();
	});

	/* Add handlers to spinners to update the selected operator database */
	for(let i = 0; i < opCardStatsQuery.length; i++) {
		$(opCardStatsQuery[i]).change(() => updateOpStat(operatorName, opCardStatsQuery[i], i));
	}
}

/* Handlers for operator */
function initOpRecipes(operatorName) {
	const htmlName = getOpHtmlName(operatorName);
	const recipeTableId = `${htmlName}-recipes`;
	const recipeTableHtml = `<table id="${recipeTableId}"></table>`
	$(`#${htmlName}-card-info`).append(recipeTableHtml);

	let operatorEntry = COOKBOOK_DATABASE.getOperator(operatorName);
	// addOperatorRecipe(operatorEntry.rank, operatorEntry.goalRank, operatorName, RECIPE_TYPES.ELITE_RANK);
	// addOperatorRecipe(operatorEntry.skillLevel, operatorEntry.skillLevelGoal, operatorName, RECIPE_TYPES.SKILL_LVL);
	// addOperatorRecipe(operatorEntry.skillMastery[0], operatorEntry.skillMasteryGoals[0], operatorName, RECIPE_TYPES.S1_MASTERY);
	// addOperatorRecipe(operatorEntry.skillMastery[1], operatorEntry.skillMasteryGoals[1], operatorName, RECIPE_TYPES.S2_MASTERY);
	// addOperatorRecipe(operatorEntry.skillMastery[2], operatorEntry.skillMasteryGoals[2], operatorName, RECIPE_TYPES.S3_MASTERY);

	for(const recipeId in operatorEntry.completedRecipes) {
		let recipeType = 0;
		if (recipeId < 10) {
			recipeType = RECIPE_TYPES.SKILL_LVL;
		}
		else if (parseInt(recipeId/10) == 1) {
			recipeType = RECIPE_TYPES.S1_MASTERY;
		}
		else if (parseInt(recipeId/10) == 2) {
			recipeType = RECIPE_TYPES.S2_MASTERY;
		}
		else if (parseInt(recipeId/10) == 3) {
			recipeType = RECIPE_TYPES.S3_MASTERY;
		}
		else {
			recipeType = RECIPE_TYPES.ELITE_RANK;
		}

		buildRecipeRow(operatorName, recipeId, recipeType)
		const recipeCompleted = operatorEntry.completedRecipes[recipeId];
		if(recipeCompleted)	{ 
			$(`#${recipeId}-${htmlName}-checkbox`).prop('checked','true');
			$($(`#${recipeId}-${htmlName}-checkbox`)[0].parentElement.parentElement).addClass('listRowComplete')
		}
	}
}

function buildOpRecipes(operatorName, opCardStatsQuery) {
	const htmlName = getOpHtmlName(operatorName);
	const numInputs = opCardStatsQuery.length;

	let baseValues = [0];
	let goalValues = [];

	let inSecondRow = false;
	for(let i = 0; i < numInputs; i++) {
		const recipeType = parseInt($(opCardStatsQuery[i]).attr("recipeType"));
		
		inSecondRow = (inSecondRow || recipeType === 0);

		if (inSecondRow === false) {
			baseValues.push(parseInt($(opCardStatsQuery[i]).val()));
		}
		else {
			goalValues.push(parseInt($(opCardStatsQuery[i]).val()));
		}
	}
	const recipeTableId = `${htmlName}-recipes`;
	const recipeTableHtml = `<table id="${recipeTableId}"></table>`
	$(`#${htmlName}-card-info`).append(recipeTableHtml);

	const RECIPE_TYPES_NAMES = Object.keys(RECIPE_TYPES);
	for(let i = 0; i < goalValues.length; i++) {
		addOperatorRecipe(baseValues[i], goalValues[i], operatorName, RECIPE_TYPES[RECIPE_TYPES_NAMES[i]]);
	}

	let operatorEntry = COOKBOOK_DATABASE.getOperator(operatorName);
	operatorEntry.finalized = true;
	COOKBOOK_DATABASE.updateOperator(operatorName, operatorEntry);
}

function updateOpStat(operatorName, query, statIdx) {
	const value = parseInt($(query).val());
	let operatorEntry = COOKBOOK_DATABASE.getOperator(operatorName);
	switch(statIdx) {
		case 0:
			operatorEntry.rank = value;
			break;
		case 1:
			operatorEntry.skillLevel = value;
			break;
		case 2:
			operatorEntry.skillMastery[0] = value;
			break;
		case 3:	
			operatorEntry.skillMastery[1] = value;
			break;
		case 4:	
			operatorEntry.skillMastery[2] = value;
			break;
		case 5:	
			operatorEntry.level = value;
			break;
		case 6:	
			operatorEntry.goalRank = value;
			break;
		case 7:	
			operatorEntry.skillLevelGoal = value;
			break;
		case 8:	
			operatorEntry.skillMasteryGoals[0] = value;
			break;
		case 9:	
			operatorEntry.skillMasteryGoals[1] = value;
			break;
		case 10:	
			operatorEntry.skillMasteryGoals[2] = value;
			break;
		default:
			break;
	}
	COOKBOOK_DATABASE.updateOperator(operatorName, operatorEntry);
}

function addOperatorRecipe(baseValue, goalValue, operatorName, recipeType) {
	if (recipeType === RECIPE_TYPES.ELITE_RANK) {
		baseValue += 100;
		goalValue += 100;
	}
	else if (recipeType === RECIPE_TYPES.SKILL_LVL) { 
	}
	else if (recipeType >= RECIPE_TYPES.S1_MASTERY) {
		baseValue += recipeType;
		goalValue += recipeType;
	}

	for (let i = baseValue + 1; i <= goalValue; i++) {
		buildRecipeRow(operatorName, i, recipeType);
	}

	// $(`table#${recipeTableId} tr`).sort(function (a, b) {
	// 	let contentA =parseInt( $(a).data('sort'));
	// 	let contentB =parseInt( $(b).data('sort'));
	// 	return (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
	//  }).appendTo(`#${recipeTableId}`)
}

function buildRecipeRow(operatorName, recipeId, recipeType) {
	const operatorEntry = COOKBOOK_DATABASE.getOperator(operatorName);
	const operatorData = OPERATOR_DATA[operatorName];
	let recipe = {};
	let recipeName = "";

	/* Build up complete recipe */
	if (recipeType === RECIPE_TYPES.ELITE_RANK && operatorData.rarity >= 3) {
		const idx = (recipeId % 10) - 1;
		recipe['LMD'] = RANK_PROMO_COST[operatorData.rarity][idx];
		recipeName = `Elite Rank `;
	}
	if (recipeType === RECIPE_TYPES.SKILL_LVL) {
		if (2 <= recipeId && recipeId <= 3) {
			recipe['Skill Summary 1'] = operatorData.getSkillSummaryCount(recipeId);
		}
		else if (4 <= recipeId && recipeId <= 6) {
			recipe['Skill Summary 2'] = operatorData.getSkillSummaryCount(recipeId);
		}
		else {
			recipe['Skill Summary 3'] = operatorData.getSkillSummaryCount(recipeId);
		}
		recipeName = `Skill Lv `;
	}
	else if (recipeType >= RECIPE_TYPES.S1_MASTERY) {
		const idx = (recipeId % 10) + 7;
		recipe['Skill Summary 3'] = operatorData.getSkillSummaryCount(idx);

		let skillName = operatorData.getSkillName(parseInt(recipeType/10));
		skillName = (skillName) ? skillName : `Skill ${parseInt(recipeType/10)}`;
		recipeName = `${skillName} M`;
	}
	Object.assign(recipe, operatorData.recipes[recipeId]);
	if (operatorEntry.finalized == false) {
		operatorEntry.completedRecipes[recipeId] = false;
		updateRecipe(recipe);
	}

	/* Build up HTML */
	const htmlName = getOpHtmlName(operatorName);
	const recipeHtmlId = `${recipeId}-${htmlName}`;
	const recipeTableId = `${htmlName}-recipes`;
	let recipeHtml = 
		`<tr id="${recipeHtmlId}" data-sort="${recipeId}">
			<td>
				<input type="checkbox" id="${recipeHtmlId}-checkbox">
				<label id="${recipeHtmlId}-checkbox-label" for="${recipeHtmlId}-checkbox">${recipeName + `${recipeId % 10}`}</label>
			</td>`;
	for(const ingredientName in recipe) {
		recipeHtml += `<td>${recipe[ingredientName]}x</td>`
		recipeHtml += `<td>${createMaterialIconHtml(ingredientName, ICON_SIZE.SMALL)}</td>`
		
		if (ingredientName in ingredientsToRecipe === false) {
			ingredientsToRecipe[ingredientName] = new Set();
		}
		ingredientsToRecipe[ingredientName].add(`${recipeId}`);
	}
	recipeHtml += `</tr>`;
	$(`#${recipeTableId}`).append(recipeHtml);
	$(`#${recipeHtmlId}-checkbox`).change((event) => {
		handleRecipeComplete(event, operatorName);
	});
}

function updateRecipe(recipe, multiplier=1) {
	for (const ingredientName in recipe) {
		COOKBOOK_DATABASE.updateRecipe(ingredientName, recipe[ingredientName] * multiplier);
	}
	updateMaterialList();
}

function handleRecipeComplete(event, operatorName) {
	const targetRow = $(event.target.parentElement.parentElement);
	const recipeId = parseInt($(event.target.parentElement.parentElement).attr('data-sort'));
	const checked = $(event.target).prop('checked');
	const operatorData = OPERATOR_DATA[operatorName];

	let recipe = {};

	if (recipeId >= 100) {
		recipe['LMD'] = RANK_PROMO_COST[operatorData.rarity][recipeId % 10 - 1];
	}
	else if (recipeId >= 10) {
		recipe['Skill Summary 3'] = operatorData.getSkillSummaryCount((recipeId% 10) + 7);
	}
	else {
		if (2 <= recipeId && recipeId <= 3) {
			recipe['Skill Summary 1'] = operatorData.getSkillSummaryCount(recipeId);
		}
		else if (4 <= recipeId && recipeId <= 6) {
			recipe['Skill Summary 2'] = operatorData.getSkillSummaryCount(recipeId);
		}
		else {
			recipe['Skill Summary 3'] = operatorData.getSkillSummaryCount(recipeId);
		}
	}

	Object.assign(recipe, operatorData.recipes[recipeId]);
	let operatorEntry = COOKBOOK_DATABASE.getOperator(operatorName);

	if(checked === true ) {
		targetRow.removeClass('listRowCanComplete');
		targetRow.addClass('listRowComplete');
		for (const ingredientName in recipe) {
			COOKBOOK_DATABASE.updateMaterialNeeded(ingredientName, recipe[ingredientName]);
			COOKBOOK_DATABASE.updateInventory(ingredientName, recipe[ingredientName] * -1);
		}
		operatorEntry.completedRecipes[recipeId] = true;
	}
	else {
		let lastIngredient = '';
		targetRow.removeClass('listRowComplete');
		for (const ingredientName in recipe) {
			COOKBOOK_DATABASE.updateMaterialNeeded(ingredientName, recipe[ingredientName] * -1);
			lastIngredient = ingredientName;
		}
		operatorEntry.completedRecipes[recipeId] = false;
		// checkRecipeCanComplete(lastIngredient);
	}
	COOKBOOK_DATABASE.updateOperator(operatorName, operatorEntry);
	updateMaterialList();
}

function checkRecipeCanComplete(materialName) {
	ingredientsToRecipe[materialName].forEach((recipeName) => {
		const delimiter = recipeName.search('-');
		const operatorName = recipeName.substring(delimiter + 1).replaceAll('-', ' ').replaceAll('_', '\'');
		const operatorData = OPERATOR_DATA[operatorName];
		let recipeId = parseInt(recipeName);
		let recipe = operatorData.recipes[recipeId];

		let inventory = COOKBOOK_DATABASE.getMaterials(Object.keys(recipe));
		let enoughMaterials = 0;
		for(const ingredientName in recipe) {
			if (inventory[ingredientName].inventory >= recipe[ingredientName]) {
				enoughMaterials ++;
			}
		}
		if ($(`#${recipeName}-checkbox`).prop('checked') === false) {
			if (enoughMaterials === Object.keys(recipe).length) {
				$(`#${recipeName}`).addClass('listRowCanComplete');
			}
			else {
				$(`#${recipeName}`).removeClass('listRowCanComplete');
			}
		}
	})
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
	const matBackground = tierBackgroundColors[tier % 10];
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
	} 
	else if (tier < 200) {
		let chipPackWords = materialName.split(' ');
		chipPackWords.shift();
		tierName = chipPackWords.join(' ');
		appendTo = `#${chipPackWords.join('')}List`;
	}
	else {
		tierName = `Skill summary`;
		appendTo = `#SkillSummaryList`;
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
		COOKBOOK_DATABASE.updateMaterialNeeded(materialName, difference);

		/* Update the row and check if things are craftable */
		updateMaterialRow(materialName, materialEntry);
		checkIfCraftable(materialName);

		const materialData = UPGRADE_MATERIALS[materialName];
		const nextTier = MATERIAL_TIER_INDEX[materialData.tier + 1];
		if (nextTier) {
			nextTier.forEach(checkIfCraftable);
		}
		// checkRecipeCanComplete(materialName);
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

	$(`input#${htmlName}InventorySpinner`).val(materialEntry.inventory);
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
	ingredientsToRecipe: ingredientsToRecipe,
	selectedRecipes: selectedRecipes,
}

}();