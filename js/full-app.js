"use strict";

$(document).ready(() => {
	materialDbModule.init();
	RecipeListModule.init();
	OperatorListFullModule.init(RecipeListModule);
	searchBar.init(OperatorListFullModule.add);

	$('#sortButton').click(OperatorListFullModule.sort);
		
	$('#clearAllSelectedBtn').click(() => {
		OperatorListFullModule.clear();
		RecipeListModule.clear();
		materialDbModule.clear();
	})
	$('#deleteAllDataBtn').click(() => {
		$('#allRarityBtn').click();
		$('#allClassesBtn').click();
		$('#name-input').val('');
		let press = jQuery.Event("keyup");
		press.ctrlKey = false;
		press.which = 8;
		$('#name-input').trigger(press);
		
		RecipeListModule.clear();
		materialDbModule.clear();
		OperatorListFullModule.clear();
	});
})