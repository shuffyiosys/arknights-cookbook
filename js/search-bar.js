"use strict";
const opIconsPath = `./img/op-icons/`;
const matIconsPath = `./img/mat-icons/`;
const classIconsPath = `./img/class-icons/`;

const searchBar = function () {
	const classNames = ['Caster', 'Defender', 'Guard', 'Medic', 'Sniper', 'Specialist', 'Supporter', 'Vanguard'];
	let addOperator = () => {};

	function init(opAddFunction=(() => {})) {
		addOperator = opAddFunction;
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
						${rarityNum} ${stars}
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
	
		$('#name-input').keyup(() => {
			filterResults();
		});

		$('#toggleSearchBtn').click(() => {
			$('#searchContainer').toggle();
		})
	
		$(window).resize(() => {
			if ($(window).width() >= 992) {
				$('#searchContainer').show();
			}
		});
	
		loadSettings();
		filterResults();
	}

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
		let iconName =getIconName(operator.name);
		let html =
			`<div class="searchEntry">
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

		$('div#searchList').append(html)
		$('div#searchList')[0].children[$('div#searchList')[0].children.length - 1].onclick = () => {
			addOperator(new OperatorEntry(operator, 1, 0));
		}
	}

	function saveSettings() {
		let guiSettings = JSON.parse(localStorage.getItem('arknightsRecipeGui'));
		if (guiSettings === null) {
			guiSettings = {
				'lastNameSearched': $('#name-input').val(),
				'classesSelected': [],
				'raritySelected': [],
			}
		}
		else {
			guiSettings.classesSelected = [];
			guiSettings.raritySelected = [];
		}
		guiSettings.lastNameSearched = $('#name-input').val();

		classNames.forEach(className => {
			const htmlName = className.toLowerCase();
			guiSettings.classesSelected.push($(`#${htmlName}Checkbox`).prop('checked'));
		});

		for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
			const htmlName = `rarity${rarityNum}`;
			guiSettings.raritySelected.push($(`#${htmlName}Checkbox`).prop('checked'));
		}

		localStorage.setItem('arknightsRecipeGui', JSON.stringify(guiSettings));
	}

	function loadSettings() {
		let guiSettings = JSON.parse(localStorage.getItem('arknightsRecipeGui'));
		if (guiSettings !== null) {
			$('#name-input').val(guiSettings.lastNameSearched);

			for(let i = 0; i < guiSettings.classesSelected.length; i++) {
				const htmlName = classNames[i].toLowerCase();
				$(`#${htmlName}Checkbox`).prop('checked', guiSettings.classesSelected[i]);
			}
	
			for (let rarityNum = 1; rarityNum <= 6; rarityNum++) {
				const htmlName = `rarity${rarityNum}`;
				$(`#${htmlName}Checkbox`).prop('checked', guiSettings.raritySelected[rarityNum - 1]);
			}
		}
	}

	return {
		init: init,
	}
}();
