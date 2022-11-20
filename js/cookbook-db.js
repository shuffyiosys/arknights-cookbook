"use strict";
function getMaxLevel(rarity, rank=0) {
	const rank0_levels = [30, 30, 40, 45, 50, 50];
	const rank1_levels = [ 0,  0, 55, 60, 70, 80];
	const rank2_levels = [ 0,  0,  0, 70, 80, 90];
	let maxLevel = rank0_levels[rarity - 1];

	if (rank === 2) {
		maxLevel = rank2_levels[rarity - 1];
	}
	else if (rank === 1) {
		maxLevel = rank1_levels[rarity - 1];
	}
	return maxLevel;
}

function getMaxRank(rarity) {
	const maxRanks = [0, 0, 1, 2, 2, 2];
	return maxRanks[rarity - 1];
}

function getSummaries(rarity, level) {
	const skillSummaries = [
		[1, 1, 1, 1, 1, 2, 0,  0,  0],
		[2, 2, 3, 3, 3, 4, 2,  4,  4],
		[4, 4, 6, 6, 6, 6, 5,  6, 10],
		[5, 5, 8, 8, 8, 8, 8, 12, 15]
	]

	if (rarity < 4 || level > 10) {
		return -1;
	}
	else {
		return skillSummaries[rarity - 3][level - 2];
	}
}

/* DB Entry classes **********************************************************/
class OperatorEntry {
	constructor() {
		this.level = 1;
		this.rank = 0;
		this.goalRank = 0;

		this.skillLevel = 1;
		this.skillLevelGoal = 1;
		this.skillMastery = [0, 0, 0];
		this.skillMasteryGoals = [0, 0, 0];

		this.finalized = false;
		this.completedRecipes = {};
	}
}

class MaterialEntry {
	constructor(inventory=0, needed=0, recipeTotal=0) {
		this.inventory = inventory;     /* In inventory */
		this.needed = needed;           /* Needed to complete the recipe */
		this.recipeTotal = recipeTotal; /* Total needed for the recipe */
	}
}

/* DB Module *****************************************************************/
const COOKBOOK_DATABASE = function() {
	let materialList = {};
	let operatorList = {};

	function init() {
		loadDatabase();
	};

	function createOperatorEntry(operatorName) {
		if (operatorName in operatorList === false) {
			const entry = new OperatorEntry();
			operatorList[operatorName] = entry;
			localStorage.setItem('arknightsRecipeOperators', JSON.stringify(operatorList));
			return entry;
		}
		return null;
	}

	function getOperatorNames() {
		return Object.keys(operatorList);
	}

	function getOperator(operatorName) {
		if (operatorName in operatorList) {
			return operatorList[operatorName];
		}
		return null;
	}

	function updateOperator(operatorName, newData) {
		let entry = null;

		if (operatorName in operatorList === false) {
			return entry;
		}
		entry = operatorList[operatorName];
		Object.assign(entry, newData);
		localStorage.setItem('arknightsRecipeOperators', JSON.stringify(operatorList));
		return entry;
	}

	function deleteOperator(operatorName) {
		delete operatorList[operatorName];
		localStorage.setItem('arknightsRecipeOperators', JSON.stringify(operatorList));
	}

	function deleteAllOperators() {
		operatorList = {};
		for (const materialName in materialList) {
			materialList[materialName].needed = 0;
			materialList[materialName].recipeTotal = 0;
		}
		localStorage.setItem('arknightsRecipeOperators', JSON.stringify(operatorList));
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(materialList));
	}

/* Materials *****************************************************************/
	function updateMaterialNeeded(materialName, amount) {
		if ((materialName in materialList) === false) {
			return;
		}
		let entry = materialList[materialName];
		entry.needed -= amount;
		const matData = UPGRADE_MATERIALS[materialName];
		for (const ingredientName in matData.recipe) {
			const ingredientNeeded = matData.recipe[ingredientName] * amount;
			updateMaterialNeeded(ingredientName, ingredientNeeded);
		}
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(materialList));
		return entry;
	}

	function updateMaterialInventory(materialName, amount) {
		if ((materialName in materialList) === false) {
			return;
		}
		let entry = materialList[materialName];
		entry.inventory += amount;
		if (entry.inventory < 0) { entry.inventory = 0; }
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(materialList));
		return entry;
	}

	function updateMaterialRecipe(materialName, amount) {
		if ((materialName in materialList) === false) {
			materialList[materialName] = new MaterialEntry();
		}
		let entry = materialList[materialName];
		entry.recipeTotal += amount;
		entry.needed += amount;
		if (entry.needed <= 0) { entry.needed = 0; }

		const matData = UPGRADE_MATERIALS[materialName];
		for (const ingredientName in matData.recipe) {
			const ingredientNeeded = matData.recipe[ingredientName] * amount;
			updateMaterialRecipe(ingredientName, ingredientNeeded);
		}

		if (entry.recipeTotal <= 0 && entry.inventory === 0) {
			delete materialList[materialName];
		}
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(materialList));
		return entry;
	}

	/* Returns a dictionary of materials. Supports either an array of strings
	   or a single string.
	 */
	function getMaterialsEntry(nameQuery) {
		let result = {};
		if(nameQuery.constructor === Array) {
			nameQuery.forEach((materialName) => {
				if ((materialName in materialList) === true) {
					result[materialName] = materialList[materialName];
				}
			})
		}
		else if (typeof(nameQuery) === "string" && (nameQuery in materialList) === true) {
			result[nameQuery] = materialList[nameQuery];
		}
		return result;
	}

	function getMaterialList() {
		return materialList;
	}

	function deleteMaterialEntry(materialName) {
		delete materialList[materialName];
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(materialList));
	}

	function deleteMaterialList () {
		localStorage.removeItem('arknightsRecipeInventory');
	}

	function deleteAll() {
		operatorList = {};
		materialList = {};
		localStorage.setItem('arknightsRecipeOperators', JSON.stringify(operatorList));
		localStorage.setItem('arknightsRecipeInventory', JSON.stringify(materialList));
	}

	function loadDatabase() {
		let inventory = JSON.parse(localStorage.getItem('arknightsRecipeInventory'));
		let operators = JSON.parse(localStorage.getItem('arknightsRecipeOperators'));
		if (inventory !== null) {
			Object.assign(materialList, inventory)
		}
		
		if (operators !== null) {
			Object.assign(operatorList, operators)
		}
	}

	return {
		init: init,

		createOperatorEntry: createOperatorEntry,
		getNames: getOperatorNames,
		getOperator: getOperator,
		updateOperator: updateOperator,
		deleteOperator: deleteOperator,
		deleteAllOperators: deleteAllOperators,

		updateInventory: updateMaterialInventory,
		updateMaterialNeeded: updateMaterialNeeded,
		updateRecipe: updateMaterialRecipe,
		getMaterials: getMaterialsEntry,
		getMaterialList: getMaterialList,
		deleteMaterial: deleteMaterialEntry,
		deleteMaterialList: deleteMaterialList,

		deleteAll: deleteAll
	}
}();