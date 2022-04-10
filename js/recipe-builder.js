"use strict";
const opIconsPath = `./img/op-icons/`;
const matIconsPath = `./img/mat-icons/`;
const classIconsPath = `./img/class-icons/`;

$(document).ready(() => {
	const levels = [ 3, 4, 5, 6, 7, 11, 12, 13, 21, 22, 23, 31, 32, 33];
	let selectedLevel = 3;
	let levelMats = {}

	levels.forEach(level => {
		let html = `<div id="lvl-${level}-list" style="display:flex; flex-direction: row;"><div>`

		if (level < 8) {
			html += `Level ${level}`;
		}
		else {
			html += `Skill ${Math.floor(level / 10)} level ${level % 10}`;
		}
		html += `</div><div id="skill-lvl-${level}"></div>`
		$('div#recipeList').append(html);
		$(`#lvl-${level}-list`).click(changeLevel)
	})

	$('#resetButton').click(() => {
		levelMats = {};

		levels.forEach(level => {
			$(`#skill-lvl-${level}`).html('')
		})
		$(`#lvl-${selectedLevel}-list`).css('background', 'none')
		$(`#lvl-3-list`).css('background', 'rgba(172, 255, 0, 0.5)');
		selectedLevel = 3;
		$('#recipeOutput').text(JSON.stringify(levelMats, null, 4))
	})

	$('#copyButton').click(() => {
		navigator.clipboard.writeText(JSON.stringify(levelMats, null, 1).replaceAll('\n', '')).then(function() {
			console.log('Async: Copying to clipboard was successful!');
		  }, function(err) {
			console.error('Async: Could not copy text: ', err);
		  });
	})

	function changeLevel() {
		const idWords = this.id.split('-');
		const level = parseInt(idWords[1]);
		$(`#lvl-${selectedLevel}-list`).css('background', 'none')
		$(this).css('background', 'rgba(172, 255, 0, 0.5)');
		selectedLevel = level;
	}

	let materialCount = 0;
	let lastTier = 1;

	for(const materialName in upgradeMaterials) {
		if (upgradeMaterials[materialName].tier > 99) {
			break;
		}
		const backgroundColor = {
			1: `#888`,
			2: `#DBE537`,
			3: `#03B1F4`,
			4: `#D5C5D8`,
			5: `#FFCA08`,
			103: `#03B1F4`,
			104: `#D5C5D8`,
			105: `#FFCA08`,
			202: `#DBE537`,
			203: `#03B1F4`,
			204: `#D5C5D8`,
		}
		const matBackground = backgroundColor[upgradeMaterials[materialName].tier];
		const fileName = materialName.replaceAll(' ', '_');
		if (lastTier != upgradeMaterials[materialName].tier) {
			lastTier = upgradeMaterials[materialName].tier;
			$('div#matList').append(`<br>`);
		}
		let html = `<div class="materialIcon ${fileName}" style="display: inline-block;
			background-image: url('${matIconsPath}${fileName}.webp'); 
			background-color: ${matBackground}"></div>`
		$('div#matList').append(html);
		$('div#matList > div')[materialCount++].onclick = materialOnClick;


		function materialOnClick() {
			if ((selectedLevel in levelMats) === false) {
				levelMats[selectedLevel] = {};
			}
			if ((materialName in levelMats[selectedLevel]) == false && 
				(selectedLevel >= 7 && Object.keys(levelMats[selectedLevel]).length >= 2) == false &&
				(selectedLevel < 7 && Object.keys(levelMats[selectedLevel]).length >= 1) == false) {

				levelMats[selectedLevel][materialName] = 1
				const idx = Object.keys(levelMats[selectedLevel]).length - 1;
				$(`div#skill-lvl-${selectedLevel}`).append(html);
				$(`div#skill-lvl-${selectedLevel} > div`)[idx].onclick = recipeOnClick;
				$(`div#skill-lvl-${selectedLevel} > div`)[idx].style.position = "relative";
				$(`div#skill-lvl-${selectedLevel} > div`)[idx].innerHTML = 
					`<p class="material-counter ${fileName}">1</p>`;
			}
			else if ((materialName in levelMats[selectedLevel]) == true){
				levelMats[selectedLevel][materialName] ++;
				$(`div#skill-lvl-${selectedLevel} > div > p.${fileName}`).text(`${levelMats[selectedLevel][materialName]}`)
			}
			$('#recipeOutput').text(JSON.stringify(levelMats, null, 4))
		}

		function recipeOnClick() {
			const materialName = this.classList[1].replaceAll('_', ' ')
			console.log(materialName)
			delete levelMats[selectedLevel][materialName];
			$(this).remove();
			$('#recipeOutput').text(JSON.stringify(levelMats, null, 4))
		}
	}

	$(`#lvl-3-list`).css('background', 'rgba(172, 255, 0, 0.5)')
	$('#recipeOutput').text(JSON.stringify(levelMats, null, 4))
});