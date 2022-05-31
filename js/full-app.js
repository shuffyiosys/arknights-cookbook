"use strict";

$(document).ready(() => {
	RecipeListModule.init();
	OperatorListFullModule.init(RecipeListModule);
	searchBar.init(OperatorListFullModule.add);

	$('#sortButton').click(OperatorListFullModule.sort);
		
	$('#clearAllSelectedBtn').click(() => {
		OperatorListFullModule.clear();
		RecipeListModule.clear();
	})
	$('#deleteAllDataBtn').click(() => {
		$('#allRarityBtn').click();
		$('#allClassesBtn').click();
		RecipeListModule.clear();
		OperatorListFullModule.clear();
	});
})