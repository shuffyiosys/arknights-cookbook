"use strict";

$(document).ready(() => {
	RecipeListModule.init();
	OperatorListFullModule.init(RecipeListModule);
	searchBar.init(OperatorListFullModule.add);

	$('#deleteAllDataBtn').click(() => {
		$('#allRarityBtn').click();
		$('#allClassesBtn').click();
		RecipeListModule.clear();
		OperatorListFullModule.clear();
	});
})