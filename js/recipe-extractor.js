counter = 2;
skillRecipe = {};
$(`th:contains("Skill upgrade")`).parent().parent().find('tr').each(function (key, val) {
	$(this).find('td').each(function (key, val) {
		if (counter > 2 && counter <= 7) {
			const tableEntry = val.children[0];
			skillRecipe[counter] = extractSkillRecipe(tableEntry);
		}
		else if(counter > 7) {
			const skillNum = val.children.length;
			const skillLevel = counter - 7;
			for(let i = 0; i < skillNum; i++) {
				let recipeIdx = (i + 1) * 10 + skillLevel;
				const tableEntry = val.children[i].children[1];
				skillRecipe[recipeIdx] = extractSkillRecipe(tableEntry);
			}
		}

		counter ++;
	})
});

function extractSkillRecipe(entry) {
	const entryLen = entry.children.length;
	let recipe = {};
	for(let i = 0; i < entryLen; i++) {
		const matEntry = entry.children[i];
		const matName = matEntry.children[0].children[0].children[0].children[0].dataset.name;
		const matAmount = matEntry.children[1].innerText;

		if (matName.search("Skill") != 0) {
			recipe[matName] = parseInt(matAmount);
		}
	}
	return recipe;
}

console.log(JSON.stringify(skillRecipe))
navigator.clipboard.writeText(JSON.stringify(skillRecipe, null, 1).replaceAll('\n', '')).then(function() {
	console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
	console.error('Async: Could not copy text: ', err);
  });


numSkills = $('div.va-collapsible-content.mw-collapsible.mw-collapsed.mw-made-collapsible > table > tbody').length
skillEntries = $('div.va-collapsible-content.mw-collapsible.mw-collapsed.mw-made-collapsible > table > tbody');
skillNames = []
for(let i = 0; i < numSkills; i++) {
	skillNames.push(skillEntries[i].children[0].children[1].children[0].innerText)
}
arrayString = `['${skillNames.toString().replaceAll(',', '\', \'')}']`
console.log(arrayString)
navigator.clipboard.writeText(arrayString).then(function() {
	console.log('Async: Copying to clipboard was successful!');
  }, function(err) {
	console.error('Async: Could not copy text: ', err);
  });