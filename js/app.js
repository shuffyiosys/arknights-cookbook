"use strict";
const opIconsPath = `./img/op-icons/`;
const matIconsPath = `./img/mat-icons/`;
const classIconsPath = `./img/class-icons/`;

$(document).ready(() => {
	let selectedOperatorList = {};
	let materialList = {};

	/** Generating the extra HTML  */
	const classNames = ['Caster', 'Defender', 'Guard', 'Medic', 'Sniper', 'Specialist', 'Supporter', 'Vanguard'];
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
		$(`#${htmlName}Checkbox`).change(() => {
			filterResults();
		})
	});
	$('#classFilterSection').append(`<br><button id="allClassesBtn" type="button" class="btn btn-sm btn-secondary">Select all</button>`);
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
					(${rarityNum}) ${stars}
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

	for (let matTierNum = 1; matTierNum <= 5; matTierNum++) {
		$(`#recipeTable`).append(`<tbody id="tier${matTierNum}MatsList"></tbody>`);
	}
	$(`#recipeTable`).append(`<tbody id="ChipList"></tbody>`);
	$(`#recipeTable`).append(`<tbody id="ChipPackList"></tbody>`);
	$(`#recipeTable`).append(`<tbody id="DualchipList"></tbody>`);

	for(let rarity = 1; rarity <= 6; rarity ++) {
		$(`#selectedOpsTable`).append(`<tbody id="operator${rarity}List"></tbody>`)
	}

	$('#name-input').keyup(() => {
		filterResults();
	});

	$('#clearAllSelectedBtn').click(() => {
		$('#selectedOpsTable > tbody').html('');
		selectedOperatorList = {};
		for (const materialName in upgradeMaterials) {
			materialList[materialName] = new MaterialEntry();
		}
		for (let matTierNum = 1; matTierNum <= 5; matTierNum++) {
			const htmlName = `tier${matTierNum}MatsList`
			$(`#${htmlName}`).html('');
		}
		$('#ChipList').html('');
		$('#ChipPackList').html('');
		$('#DualchipList').html('');
		saveSettings();
	})

	// $('#testBtn').click(() => {
	// 	console.log(selectedOperatorList)
	// });

	$('#matListBtn').click(() => {
		console.log(materialList)
	})

	$('#selectedOperatorsTab').click(() => {
		$('#selectedOperatorsPage').show();
		$('#recipeListPage').hide();
		$('#selectedOperatorsTab > a').addClass('active');
		$('#recipeListTab > a').removeClass('active');
	})

	$('#recipeListTab').click(() => {
		$('#recipeListPage').show();
		$('#selectedOperatorsPage').hide();
		$('#recipeListTab > a').addClass('active');
		$('#selectedOperatorsTab > a').removeClass('active');
	})

	$('#ignoreRecipeMatsCheckbox').change(() => {
		switchRecipeList();
	})

	loadSettings();

	function filterResults() {
		// Filter on names
		const searchStr = $('#name-input').val();
		let nameSearchRegex = new RegExp(`^${searchStr}`, 'i');
		let filteredOps = operatorList.filter(operator => {
			return nameSearchRegex.test(operator.name);
		})

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
		filteredOps = filteredOps.filter(operator => {
			return ((operator.opClass & classFilter) > 0);
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
		filteredOps = filteredOps.filter(operator => {
			return (rarityFitler.indexOf(operator.rarity) > -1);
		});

		$('div#searchList').html('')
		filteredOps.forEach(createSearchListEntry);
		saveSettings();
	}

	function createSearchListEntry(operator) {
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operator.name.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');

		let iconName =getIconName(operator.name);
		let html =
			`<div id="${htmlName}" class="searchEntry">
				<div class="row">
					<div class="col-3">
						<img src="${opIconsPath}${iconName}_icon.webp" width="60px" />
					</div>
					<div class="col-9">
						<span>${operator.name}</span><br>
						<span>${operator.getRarity_toString()} ${operator.getClass_toString()}</span><br>
					</div>
				</div>
			</div>`

		$('div#searchList').append(html);
		$(`div#${htmlName}`).click(() => {
			if ((operator.name in selectedOperatorList) == false) {
				addOperatorToList(operator);
			}
		})
	}

	function addOperatorToList(operator) {
		/* HTML things to add */
		selectedOperatorList[operator.name] = new OperatorEntry(operator, 1, 0);
		buildSelectedOperatorList(operator.name);

		/* Ingredients to add */
		for (const material in operator.e1_mats) {
			updateMaterialRecipeList(material, operator.e1_mats[material]);
		}

		for (const material in operator.e2_mats) {
			updateMaterialRecipeList(material, operator.e2_mats[material]);
		}

		updateGoals(selectedOperatorList[operator.name]);
		updateRecipeList();
	}

	function removeOperatorFromList(operator) {
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operator.name.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');
		$(`tr#${htmlName}SelectedRow`).remove();
		delete selectedOperatorList[operator.name];

		for (const material in operator.e2_mats) {
			updateMaterialRecipeList(material, -operator.e2_mats[material]);
		}

		for (const material in operator.e1_mats) {
			updateMaterialRecipeList(material, -operator.e1_mats[material]);
		}

		updateRecipeList();
	}

	function buildSelectedOperatorList(operatorName) {
		let entry = selectedOperatorList[operatorName];
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operatorName.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');

		let iconName = getIconName(operatorName);
		let maxRank = entry.getMaxRank();
		let maxLevel = entry.getMaxLevel(maxRank);
		let rarityBackground = '#FFF';

		switch (entry.operator.rarity) {
			case 2:
				rarityBackground = '#E1FF00';
				break;
			case 3:
				rarityBackground = '#26A4FF';
				break;
			case 4:
				rarityBackground = '#CBBAFF';
				break;
			case 5:
				rarityBackground = '#FFE97F';
				break;
			case 6:
				rarityBackground = '#F88E18';
				break;
			default:
				rarityBackground = '#FFF';
				break;
		}
		let gamePressName = operatorName.toLowerCase().replace(/'| the|\./g, '').replaceAll(' ', '-');

		let html =
			`<tr id="${htmlName}SelectedRow">
				<td>
					<div class="materialIcon" style="background-image: url('${opIconsPath}${iconName}_icon.webp'); background-color: ${rarityBackground}"></div>
				</td>
				<td><span>${operatorName}</span><br>
					<a href="https://arknights.fandom.com/wiki/${operatorName}" target="_blank" title="Fandom Wiki Page">
					<img src="./img/fandom_wiki_logo.png" width="24px">
					</a>
					<a href="https://gamepress.gg/arknights/operator/${gamePressName}" target="_blank" title="Gamepress Page">
					<img src="./img/gamepress_logo.png" width="24px">
					</a>
				</td>
				<td><img src="${classIconsPath}${entry.operator.getClass_toString()}.webp" alt="" height="48px">${entry.operator.getClass_toString()}</td>
				<td>${entry.operator.getRarity_toString()}</td>
				<td><input id="${htmlName}CurrentRankSpinner" type="number" min="0" max="${entry.getMaxRank()}" value="0"></td>
				<td><input id="${htmlName}CurrentLevelSpinner" type="number" min="1" max="${entry.getMaxLevel()}" value="1"></td>
				<td><input id="${htmlName}GoalRankSpinner" type="number" min="0" max="${maxRank}" value="${maxRank}"></td>
				<td><input id="${htmlName}GoalLevelSpinner" type="number" min="1" max="${maxLevel}" value="${maxLevel}"></td>
				<td><button id="${htmlName}RemoveBtn" type="button" class="btn btn-sm btn-danger" title="Remove this operator">X</button></td>
			</tr>`

		$(`#operator${entry.operator.rarity}List`).append(html);
		$(`button#${htmlName}RemoveBtn`).click(() => {
			removeOperatorFromList(entry.operator);
		});

		$(`input#${htmlName}CurrentLevelSpinner`).change(() => {
			entry.level = parseInt($(`input#${htmlName}CurrentLevelSpinner`).val());
			updateGoals(entry);
		});

		$(`input#${htmlName}GoalLevelSpinner`).change(() => {
			entry.goalLevel = parseInt($(`input#${htmlName}GoalLevelSpinner`).val());
			updateGoals(entry);
		});

		$(`input#${htmlName}CurrentRankSpinner`).change(() => {
			const nextRank = parseInt($(`input#${htmlName}CurrentRankSpinner`).val());
			if (entry.rank != nextRank) {
				const maxLevel = entry.getMaxLevel(nextRank);
				const currentLevelSpinner = $(`input#${htmlName}CurrentLevelSpinner`);
				currentLevelSpinner.attr('max', maxLevel);
				currentLevelSpinner.val(1);
				updateMaterialsList(entry.rank, nextRank, entry.operator);
				entry.rank = nextRank;
				entry.level = 1;
				updateGoals(entry);
			}

		});

		$(`input#${htmlName}GoalRankSpinner`).change(() => {
			const nextRank = parseInt($(`input#${htmlName}GoalRankSpinner`).val());
			if (entry.goalRank != nextRank) {
				const maxLevel = entry.getMaxLevel(nextRank);
				const goalLevelSpinner = $(`input#${htmlName}GoalLevelSpinner`);
				goalLevelSpinner.attr('max', maxLevel);
				goalLevelSpinner.val(maxLevel);
				updateMaterialsList_GoalRank(entry.goalRank, nextRank, entry.operator);
				entry.goalRank = nextRank;
				entry.goalLevel = maxLevel;
				updateGoals(entry);
			}
		});

		// let rows = $('tr', `#operator${entry.operator.rarity}List`);
		// rows.sort((a, b) => {
		// 	let keyA = $('td > span', a).text();
		//   let keyB = $('td > span', b).text();
		//   return (keyA > keyB) ? 1 : 0;
		// })
		// $(`#operator${entry.operator.rarity}List`).html('');
		// $(`#operator${entry.operator.rarity}List`).append(rows);
	}

	/* Upgrade Material functions -----------------------------------------------*/
	/**
	 * Updates the materials list
	 * @param {String} material Material name
	 * @param {Number} amount Amount of material to add or subtract
	 * @param {Number} multiplier Multiplier factor
	 * 
	 * This recursively looks into the material's recipes to update the lower tier
	 * items needd to craft it.
	 */
	function updateMaterialRecipeList(material, amount, multiplier = 1) {
		if (material in materialList == false) {
			console.log(material);
		}
		if (material === "") {
			return;
		}
		materialList[material].needed += (amount * multiplier);
		materialList[material].haveLeft += (amount * multiplier);

		if (materialList[material].needed < 0) {
			materialList[material].needed = 0;
		}

		addMaterialToRecipeList(material);
		if ($('#ignoreRecipeMatsCheckbox').prop('checked') == false) {
			const recipe = upgradeMaterials[material].recipe;
			for (const ingredient in recipe) {
				updateMaterialRecipeList(ingredient, recipe[ingredient], amount * multiplier);
			}
		}

	}

	function updateMaterialInventoryList(material, amount) {
		materialList[material].haveLeft += amount;

		const recipe = upgradeMaterials[material].recipe;
		for (const ingredient in recipe) {
			updateMaterialInventoryList(ingredient, (recipe[ingredient] * amount));
		}
	}

	function switchRecipeList() {
		/* Zero out everything of what's needed and have left */
		for (const materialName in materialList) {
			materialList[materialName].needed = 0;
			materialList[materialName].haveLeft = 0;
		}

		/* Update using the operator's mat lists, the update function will ignore the recipes in there */
		for (const operatorName in selectedOperatorList) {
			const operatorData = selectedOperatorList[operatorName].operator;
			for (const material in operatorData.e1_mats) {
				updateMaterialRecipeList(material, operatorData.e1_mats[material]);
				materialList[material].haveLeft = materialList[material].needed - materialList[material].has;
				if (materialList[material].haveLeft < 0) {
					materialList[material].haveLeft = 0;
				}
			}

			for (const material in operatorData.e2_mats) {
				updateMaterialRecipeList(material, operatorData.e2_mats[material]);
				materialList[material].haveLeft = materialList[material].haveLeft - materialList[material].has;
				if (materialList[material].haveLeft < 0) {
					materialList[material].haveLeft = 0;
				}
			}

		}
		updateRecipeList();
	}

	function addMaterialToRecipeList(material) {
		const htmlName = material.replaceAll(' ', '');
		if ($(`#${htmlName}MatRow`).length != 0 || materialList[material].needed == 0) {
			return;
		}

		const tierBackgroundColors = {
			1: `#888`,
			2: `#DBE537`,
			3: `#03B1F4`,
			4: `#D5C5D8`,
			5: `#FFCA08`,
			103: `#03B1F4`,
			104: `#D5C5D8`,
			105: `#FFCA08`
		}

		const fileName = material.replaceAll(' ', '_');
		const tier = upgradeMaterials[material].tier;

		let matBackground = tierBackgroundColors[tier];
		// let appendTo = '> table > tbody';
		let appendTo = '';
		let tierName = `${tier}`;

		if (tier < 100) {
			appendTo = `#tier${tier}MatsList`;
		} else {
			let chipPackWords = material.split(' ');
			chipPackWords.shift();
			tierName = chipPackWords.join(' ');
			appendTo = `#${chipPackWords.join('')}List`;
		}

		const matHtml =
			`<tr id="${htmlName}MatRow">
				<td><div class="materialIcon" style="background-image: url('${matIconsPath}${fileName}.webp'); background-color: ${matBackground}"></div></td>
				<td>${material}</td>
				<td>${tierName}</td>
				<td><input id="${htmlName}InventorySpinner" type="number" min="0" max="999" value="${materialList[material].has}">
				<td id="${htmlName}MatNeeded"></td>
			</tr>`;
		$(appendTo).append(matHtml);

		$(`input#${htmlName}InventorySpinner`).change(() => {
			let amount = parseInt($(`input#${htmlName}InventorySpinner`).val());

			/* Account for bad parse (reset it to whatever is in the list) */
			if (isNaN(amount) == true) {
				amount = materialList[material].has;
				$(`input#${htmlName}InventorySpinner`).val(amount);
			}
			/* Cap the actual values used to what's needed and no more, this
			   helps prevent higher tier mats from affecting lower tier 
			   counts if the higher tier is complete. */
			else if (amount > materialList[material].needed) {
				amount = materialList[material].needed;
			}
			const diff = materialList[material].has - amount;
			materialList[material].has = amount;

			updateMaterialInventoryList(material, diff);
			updateRecipeList();

			for (const operatorName in selectedOperatorList) {
				updateGoals(selectedOperatorList[operatorName]);
			}
		})
	}

	function updateRecipeList() {
		saveSettings();
			
		for (const material in materialList) {
			const htmlName = material.replaceAll(' ', '');

			if (materialList[material].needed == 0) {
				$(`#${htmlName}MatRow`).remove();
				continue;
			}

			const haveLeft = (materialList[material].haveLeft <= 0) ? 0 : materialList[material].haveLeft;
			$(`td#${htmlName}MatNeeded`).html(`${haveLeft} / ${materialList[material].needed}`);
			if (haveLeft == 0) {
				$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
				$(`#${htmlName}MatRow`).addClass('listRowComplete');
				
			} else if ($('#ignoreRecipeMatsCheckbox').prop('checked') == false) {
				$(`#${htmlName}MatRow`).removeClass('listRowComplete');

				let canCraft = true;
				let count = 0;
				for (const ingredient in upgradeMaterials[material].recipe) {
					const amountNeeded = upgradeMaterials[material].recipe[ingredient] * haveLeft;
					canCraft = canCraft & (amountNeeded <= materialList[ingredient].has);
					count++;
				}

				if (count > 0 && canCraft == true) {
					$(`#${htmlName}MatRow`).addClass('listRowCanComplete');
				} else {
					$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
				}
			}
		}
	}

	function updateGoals(operatorEntry) {
		const operatorData = operatorEntry.operator;
		let htmlNameRegex = new RegExp(/[\(\)\\\.']/, 'g');
		let htmlName = operatorData.name.replaceAll(' ', '-');
		htmlName = htmlName.replaceAll(htmlNameRegex, '');

		if (operatorEntry.getGoalMet()) {
			$(`tr#${htmlName}SelectedRow`).removeClass('listRowCanComplete');
			$(`tr#${htmlName}SelectedRow`).addClass('listRowComplete');
		} else if (operatorEntry.getGrowthState() == GROWTH_STATE.E0_MAX &&
			operatorData.checkEnoughMaterials(materialList, 1)) {
			$(`tr#${htmlName}SelectedRow`).removeClass('listRowComplete');
			$(`tr#${htmlName}SelectedRow`).addClass('listRowCanComplete');
		} else if (operatorEntry.getGrowthState() == GROWTH_STATE.E1_MAX &&
			operatorData.checkEnoughMaterials(materialList, 2)) {
			$(`tr#${htmlName}SelectedRow`).removeClass('listRowComplete');
			$(`tr#${htmlName}SelectedRow`).addClass('listRowCanComplete');
		} else {
			$(`tr#${htmlName}SelectedRow`).removeClass('listRowComplete');
			$(`tr#${htmlName}SelectedRow`).removeClass('listRowCanComplete');
		}
	}

	function updateMaterialsList(oldRank, newRank, operatorData) {
		if (oldRank < newRank) {
			for(let rank = oldRank; rank < newRank; rank++ ){
				if (rank == 0) {
					for (const material in operatorData.e1_mats) {
						const amount = operatorData.e1_mats[material] * -1;
						updateMaterialRecipeList(material, amount);
					}
				}
				if (rank == 1) {
					for (const material in operatorData.e2_mats) {
						const amount = operatorData.e2_mats[material] * -1;
						updateMaterialRecipeList(material, amount);
					}
				}
			}
		} else {
			for(let rank = oldRank; rank > newRank; rank--){
				if (rank == 1) {
					for (const material in operatorData.e1_mats) {
						const amount = operatorData.e1_mats[material];
						updateMaterialRecipeList(material, amount);
					}
				}
				if (rank == 2) {
					for (const material in operatorData.e2_mats) {
						const amount = operatorData.e2_mats[material];
						updateMaterialRecipeList(material, amount);
					}
				}
			}
		}
		updateRecipeList();
	}

	function updateMaterialsList_GoalRank(oldRank, newRank, operatorData) {
		console.log("Updating goal rank", oldRank, newRank)
		// Going up
		// From E0 to E1 - Add E1 mats
		// From E1 to E2 - Add E2 mats
		if (oldRank < newRank) {
			for(let rank = oldRank; rank < newRank; rank++){
				if (rank == 0) {
					for (const material in operatorData.e1_mats) {
						const amount = operatorData.e1_mats[material];
						updateMaterialRecipeList(material, amount);
					}
				} else if (rank == 1) {
					for (const material in operatorData.e2_mats) {
						const amount = operatorData.e2_mats[material];
						updateMaterialRecipeList(material, amount);
					}
				}
			}

		}
		// Going down
		// From E2 to E1 - Remove E2 mats
		// From E1 to E0 - Remove E1 mats
		else {
			for(let rank = oldRank; rank > newRank; rank--) {
				if (rank == 1) {
					for (const material in operatorData.e1_mats) {
						const amount = operatorData.e1_mats[material] * -1;
						updateMaterialRecipeList(material, amount);
					}
				} else if (rank == 2) {
					for (const material in operatorData.e2_mats) {
						const amount = operatorData.e2_mats[material] * -1;
						updateMaterialRecipeList(material, amount);
					}
				}
			}
		}
		updateRecipeList();
	}

	function getIconName(name) {
		name = name.replace(/ /g, '_');
		name = name.replace(/'/g, '');
		return name;
	}

	function saveSettings() {
		let guiSettings = {
			'ignoreMatRecipes': $('#ignoreRecipeMatsCheckbox').prop('checked'),
			'lastNameSearched': $('#name-input').val(),
			'classesSelected': [],
			'raritySelected': [],
		}

		classNames.forEach(className => {
			const htmlName = className.toLowerCase();
			guiSettings.classesSelected.push($(`#${htmlName}Checkbox`).prop('checked'));
		});

		for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
			const htmlName = `rarity${rarityNum}`;
			guiSettings.raritySelected.push($(`#${htmlName}Checkbox`).prop('checked'));
		}

		localStorage.setItem('arknightsRecipeOperators', JSON.stringify(selectedOperatorList));
		localStorage.setItem('arknightsRecipeMaterials', JSON.stringify(materialList));
		localStorage.setItem('arknightsRecipeGui', JSON.stringify(guiSettings))
	}

	function loadSettings() {
		let operators = JSON.parse(localStorage.getItem('arknightsRecipeOperators'));
		let materials = JSON.parse(localStorage.getItem('arknightsRecipeMaterials'));
		let guiSettings = JSON.parse(localStorage.getItem('arknightsRecipeGui'));

		if (guiSettings !== null) {
			$('#ignoreRecipeMatsCheckbox').prop('checked', guiSettings.ignoreMatRecipes);
			$('#name-input').val(guiSettings.lastNameSearched);

			for(let i = 0; i < guiSettings.classesSelected.length; i++) {
				const htmlName = classNames[i].toLowerCase();
				console.log(htmlName, guiSettings.classesSelected[i])
				$(`#${htmlName}Checkbox`).prop('checked', guiSettings.classesSelected[i]);
			}
	
			for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
				const htmlName = `rarity${rarityNum}`;
				console.log(htmlName, guiSettings.raritySelected[rarityNum])
				$(`#${htmlName}Checkbox`).prop('checked', guiSettings.raritySelected[rarityNum - 1]);
			}
		}

		if (operators !== null && materials !== null) {
			console.log('Loading saved data', operators, materials)
			materialList = materials;
			
			for(const material in materialList) {
				addMaterialToRecipeList(material);
			}
			for(const operatorName in operators) {
				let filteredOps = operatorList.filter(operator => {
					let nameSearchRegex = new RegExp(`^${operatorName}$`, 'i');
					return nameSearchRegex.test(operator.name);
				})
				selectedOperatorList[operatorName] = new OperatorEntry(filteredOps[0], 1, 0);
				buildSelectedOperatorList(operatorName);
			}
			updateRecipeList();
		}
		else {
			for (const materialName in upgradeMaterials) {
				materialList[materialName] = new MaterialEntry();
			}
		}
	}

	filterResults();
});
