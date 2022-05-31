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