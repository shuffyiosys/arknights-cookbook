function extractSkillRecipe(entry, startIdx=0) {
	const entryLen = entry.children.length;
	let recipe = {};
	for(let i = startIdx; i < entryLen; i++) {
		const matEntry = entry.children[i];
		const matName = matEntry.children[0].children[0].children[0].children[0].dataset.name;
		const matAmount = matEntry.children[1].innerText;

		if (matName.search("Skill") != 0) {
			recipe[matName] = parseInt(matAmount);
			if (matAmount.search("K") > -1) {
				recipe[matName] *= 1000;
			}
		}
	}
	return recipe;
}

operatorName = $(`#firstHeading`)[0].innerHTML.replaceAll('\t', '').replaceAll('\n','');
operatorRarity = parseInt($('.mw-redirect')[0].title);
operatorClass = $('span > a')[0].title.toUpperCase();

recipes = {};
recipeIdx = 101;
$(`th:contains("Promotion")`).parent().parent().find('tr').each(function (key, val) {
	$(this).find('td').each(function (key, val) {
		const tableEntry = val.children[0];
		recipes[recipeIdx++] = extractSkillRecipe(tableEntry.children[3].children[1], 1)
	})
});

recipeIdx = 2;
$(`th:contains("Skill upgrade")`).parent().parent().find('tr').each(function (key, val) {
	$(this).find('td').each(function (key, val) {
		if (recipeIdx > 2 && recipeIdx <= 7) {
			const tableEntry = val.children[0];
			recipes[recipeIdx] = extractSkillRecipe(tableEntry);
		}
		else if(recipeIdx > 7) {
			const skillNum = val.children.length;
			const skillLevel = recipeIdx - 7;
			for(let i = 0; i < skillNum; i++) {
				let recipeIdx = (i + 1) * 10 + skillLevel;
				const tableEntry = val.children[i].children[1];
				try {
					recipes[recipeIdx] = extractSkillRecipe(tableEntry);
				}
				catch {
					
				}
			}
		}

		recipeIdx ++;
	})
});

numSkills = $('div.mw-collapsible.mw-collapsed.mw-made-collapsible > table > tbody').length
skillEntries = $('div.mw-collapsible.mw-collapsed.mw-made-collapsible > table > tbody');
skillNames = []
for(let i = 0; i < numSkills; i++) {
	try {
		skillNames.push(skillEntries[i].children[0].children[1].children[0].innerText)
	}
	catch {
		
	}
}

console.log(JSON.stringify(recipes))
console.log(skillNames)
outputString = `"${operatorName}": new OperatorData(CLASS.${operatorClass}, ${operatorRarity}, ` 
outputString += JSON.stringify(recipes, null, 1).replaceAll('\n', '').replaceAll(`{ "`, '{').replaceAll(`": {  `, `: {`).replaceAll(` }, "`, `}, `).replaceAll(`  `, ` `).replaceAll('11:', '\n    11:').replaceAll('21:', '\n    21:').replaceAll('31:', '\n    31:').replaceAll('101:', '\n    101:')
outputString += `,\n    ['${skillNames.toString().replaceAll(',', '\', \'')}']),`
navigator.clipboard.writeText(outputString).then(function() {
	console.log('Async: Copying to clipboard was successful!');
	}, function(err) {
	console.error('Async: Could not copy text: ', err);
	});