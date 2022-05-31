"use strict";

class Material {
	constructor(tier, recipe) {
		this.tier = tier;
		this.recipe = recipe;
	}
};

class MaterialEntry {
	constructor() {
		/* How much is in inventory */
		this.inventory = 0;
		
		/* How much is needed to complete the recipe */
		this.needed = 0;

		/* How much the recipe calls for */
		this.recipeTotal = 0;
	}
}

const upgradeMaterials = {
	// Tier 1
	'Orirock': new Material(1, {}),
	'Oriron Shard': new Material(1, {}),
	'Diketon': new Material(1, {}),
	'Sugar Substitute': new Material(1, {}),
	'Ester': new Material(1, {}),
	'Damaged Device': new Material(1, {}),

	// Tier 2
	'Orirock Cube': new Material(2, {'Orirock': 3}),
	'Oriron': new Material(2, {'Oriron Shard': 3}),
	'Polyketon': new Material(2, {'Diketon': 3}),
	'Sugar': new Material(2, {'Sugar Substitute': 3}),
	'Polyester': new Material(2, {'Ester': 3}),
	'Device': new Material(2, {'Damaged Device': 3}),

	// Tier 3
	'Orirock Cluster': new Material(3, {'Orirock Cube': 5}),
	'Oriron Cluster': new Material(3, {'Oriron': 4}),
	'Aketon':new Material(3, {'Polyketon': 4}),
	'Sugar Pack': new Material(3, {'Sugar': 4}),
	'Polyester Pack': new Material( 3, {'Polyester': 4}),
	'Integrated Device': new Material(3, {'Device': 4}),
	'Grindstone': new Material(3, {}),
	'RMA70-12': new Material(3, {}),
	'Manganese Ore': new Material(3, {}),
	'Loxic Kohl': new Material(3, {}),
	'Incandescent Alloy': new Material(3, {}),
	'Crystalline Component': new Material(3, {}),
	'Coagulating Gel': new Material(3, {}),
	'Compound Lubricant': new Material(3, {}),
	'Compound Cutting Fluid': new Material(3, {}),
	'Semi-Synthetic Solvent': new Material(3, {}),

	// Tier 4
	'Orirock Concentration':    new Material(4, {'Orirock Cluster': 5}),
	'Oriron Block':             new Material(4, {'Oriron Cluster': 2, 'Integrated Device': 1, 'Polyester Pack': 1}),
	'Keton Colloid':            new Material(4, {'Aketon': 2, 'Sugar Pack': 1, 'Manganese Ore': 1}),
	'Sugar Lump':               new Material(4, {'Sugar Pack': 2, 'Oriron Cluster': 1, 'Manganese Ore': 1}),
	'Polyester Lump':           new Material(4, {'Polyester Pack': 2, 'Aketon': 1, 'Loxic Kohl': 1}),
	'Optimized Device':         new Material(4, {'Integrated Device': 1, 'Orirock Cluster': 2, 'Grindstone': 1}),
	'Grindstone Pentahydrate':  new Material(4, {'Grindstone': 1, 'Oriron Cluster': 1, 'Integrated Device': 1}),
	'RMA70-24':                 new Material(4, {'RMA70-12': 1, 'Orirock Cluster': 1, 'Aketon': 1}),
	'Manganese Trihydrate':     new Material(4, {'Manganese Ore': 2, 'Polyester Pack': 1, 'Loxic Kohl': 1}),
	'White Horse Kohl':         new Material(4, {'Loxic Kohl': 1, 'Sugar Pack': 1, 'RMA70-12': 1}),
	'Incandescent Alloy Block': new Material(4, {'Integrated Device': 1, 'Grindstone': 1, 'Incandescent Alloy': 1}),
	'Crystalline Circuit':      new Material(4, {'Crystalline Component': 1, 'Coagulating Gel': 1, 'Incandescent Alloy': 1}),
	'Polymerized Gel':          new Material(4, {'Oriron Cluster': 1, 'Coagulating Gel': 1, 'Incandescent Alloy': 1}),
	'Pure Lubricant':           new Material(4, {}),
	'Refined Solvent':          new Material(4, {}),

	// Tier 5
	'Bipolar Nanoflake':            new Material(5, {'Optimized Device': 1, 'White Horse Kohl': 2}),
	'Crystalline Electronic Unit':  new Material(5, {'Crystalline Circuit': 1, 'Polymerized Gel': 2, 'Incandescent Alloy Block': 1}),
	'D32 Steel':                    new Material(5, {'Manganese Trihydrate': 1, 'Grindstone Pentahydrate': 1, 'RMA70-24': 1}),
	'Polymerization Preparation':   new Material(5, {'Orirock Concentration': 1, 'Oriron Block': 1, 'Keton Colloid': 1}),

	// Chips
	'Caster Chip': new Material(103, {}),
	'Defender Chip': new Material(103, {}),
	'Guard Chip': new Material(103, {}),
	'Medic Chip': new Material(103, {}),
	'Sniper Chip': new Material(103, {}),
	'Specialist Chip': new Material(103, {}),
	'Supporter Chip': new Material(103, {}),
	'Vanguard Chip': new Material(103, {}),

	'Caster Chip Pack': new Material(104, {}),
	'Defender Chip Pack': new Material(104, {}),
	'Guard Chip Pack': new Material(104, {}),
	'Medic Chip Pack': new Material(104, {}),
	'Sniper Chip Pack': new Material(104, {}),
	'Specialist Chip Pack': new Material(104, {}),
	'Supporter Chip Pack': new Material(104, {}),
	'Vanguard Chip Pack': new Material(104, {}),
	
	'Caster Dualchip': new Material(105, {'Caster Chip Pack': 2}),
	'Defender Dualchip': new Material(105, {'Defender Chip Pack': 2}),
	'Guard Dualchip': new Material(105, {'Guard Chip Pack': 2}),
	'Medic Dualchip': new Material(105, {'Medic Chip Pack': 2}),
	'Sniper Dualchip': new Material(105, {'Sniper Chip Pack': 2}),
	'Specialist Dualchip': new Material(105, {'Specialist Chip Pack': 2}),
	'Supporter Dualchip': new Material(105, {'Supporter Chip Pack': 2}),
	'Vanguard Dualchip': new Material(105, {'Vanguard Chip Pack': 2}),

	// Skills
	'Skill Summary 1': new Material(202, {}),
	'Skill Summary 2': new Material(203, {}),
	'Skill Summary 3': new Material(204, {}),
};

const RecipeListModule = function () {
	let materialList = {};

	function init() {
		for (let matTierNum = 1; matTierNum <= 5; matTierNum++) {
			$(`#recipeTable`).append(`<tbody id="tier${matTierNum}MatsList"></tbody>`);
		}
		$(`#recipeTable`).append(`<tbody id="ChipList"></tbody>`);
		$(`#recipeTable`).append(`<tbody id="ChipPackList"></tbody>`);
		$(`#recipeTable`).append(`<tbody id="DualchipList"></tbody>`);
		clearRecipeList();
	}

	function createMaterialEntry(materialName) {
		const material = {name: materialName, amounts: materialList[materialName]};
		const htmlName = materialName.replaceAll(' ', '');
		if ($(`#${htmlName}MatRow`).length != 0 || material.amounts.recipeTotal == 0) {
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

		const fileName = materialName.replaceAll(' ', '_');
		const tier = upgradeMaterials[materialName].tier;

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
				<td><input id="${htmlName}InventorySpinner" type="number" min="0" max="999" value="${material.amounts.inventory}">
				<td id="${htmlName}MatNeeded"></td>
			</tr>`;
		$(appendTo).append(matHtml);

		$(`input#${htmlName}InventorySpinner`)[0].lastValue = material.amounts.inventory;

		$(`input#${htmlName}InventorySpinner`).change((spinner) => {
			let number = parseInt($(spinner.target).val());
			if (isNaN(number) || number > spinner.target.max) {
				return;
			}
			else {
				const diff = number - $(`input#${htmlName}InventorySpinner`)[0].lastValue;
				material.amounts.inventory += diff;
				updateMaterialAmount(material, -diff);
				$(`input#${htmlName}InventorySpinner`)[0].lastValue = number;
				saveSettings();
			}
		});
	}

	function updateMaterialAmount(material, amount) {
		const htmlName = material.name.replaceAll(' ', '');
		console.log(material.amounts.needed);
		material.amounts.needed += amount;

		let needed = material.amounts.needed;
		if (needed <= 0) {
			needed = 0;
			$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
			$(`#${htmlName}MatRow`).addClass('listRowComplete');
		}
		else {
			$(`#${htmlName}MatRow`).removeClass('listRowComplete');
		}

		$(`td#${htmlName}MatNeeded`).html(`${needed} / ${material.amounts.recipeTotal}`);

		const recipe = upgradeMaterials[material.name].recipe
		for(const ingredient in recipe) {
			const ingredientInfo = {name: ingredient, amounts: materialList[ingredient]};
			updateMaterialAmount(ingredientInfo, recipe[ingredient] * amount);
		}
	}

	function addMaterialToRecipe(material, amount, multiplier = 1) {
		if (material in materialList == false || material === "") {
			console.log(`Could not find this material: ${material}`);
			return;
		}

		materialList[material].recipeTotal += (amount * multiplier);
		materialList[material].needed += (amount * multiplier);

		createMaterialEntry(material);
		if ($('#ignoreRecipeMatsCheckbox').prop('checked') == false) {
			const recipe = upgradeMaterials[material].recipe;
			for (const ingredient in recipe) {
				addMaterialToRecipe(ingredient, recipe[ingredient], amount * multiplier);
			}
		}
	}

	function updateRecipeList() {
		for (const materialName in materialList) {
			const material = materialList[materialName];
			const htmlName = materialName.replaceAll(' ', '');

			if (material.recipeTotal == 0) {
				$(`#${htmlName}MatRow`).remove();
				continue;
			}
			let needed = material.needed;
			needed = (needed < 0) ? 0 : needed;

			$(`td#${htmlName}MatNeeded`).html(`${needed} / ${material.recipeTotal}`);
			$(`input#${htmlName}InventorySpinner`).val(material.inventory);
			
			if (needed == 0) {
				$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
				$(`#${htmlName}MatRow`).addClass('listRowComplete');
				
			} else if ($('#ignoreRecipeMatsCheckbox').prop('checked') == false) {
				$(`#${htmlName}MatRow`).removeClass('listRowComplete');

				// let canCraft = false;
				// const recipe = upgradeMaterials[materialName].recipe;
				// for (const ingredient in recipe) {
				// 	const ingredientNeeded = (recipe[ingredient] * needed);
				// 	canCraft = materialList[ingredient].needed < ingredientNeeded;
				// }

				// if (canCraft == true) {
				// 	$(`#${htmlName}MatRow`).addClass('listRowCanComplete');
				// } else {
				// 	$(`#${htmlName}MatRow`).removeClass('listRowCanComplete');
				// }
			}
		}
	}

	function saveSettings() {
		let savedInventory = {};
		for (const materialName in materialList) {
			if (materialList[materialName].recipeTotal > 0) {
				savedInventory[materialName] = materialList[materialName];
			}
		}
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(savedInventory));
	}

	function loadSettings() {
		let inventory = JSON.parse(localStorage.getItem('arknightsRecipeInventory'));
		if (inventory !== null) {
			for (const materialName in inventory) {
				Object.assign(materialList[materialName], inventory[materialName]);
			}
		}
		console.log(inventory)
	}

	function clearRecipeList() {
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
	}

	return {
		init: init,
		add: addMaterialToRecipe,
		clear: clearRecipeList,
		update: updateRecipeList,
		load: loadSettings,
		save: saveSettings,
		get: () => {return materialList}
	}
}();