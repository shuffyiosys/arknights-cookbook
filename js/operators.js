const CLASS = {
	CASTER:     1,
	DEFENDER:   2,
	GUARD:      4,
	MEDIC:      8,
	SNIPER:     16,
	SPECIALIST: 32,
	SUPPORTER:  64,
	VANGUARD:   128 
}

const CLASS_TO_STRING = {
	1: "Caster",
	2: "Defender",
	4: "Guard",
	8: "Medic",
	16: "Sniper",
	32: "Specialist",
	64: "Supporter",
	128: "Vanguard"
}

const GROWTH_STATE = {
	E0: 0,
	E0_MAX: 1,
	E1: 2,
	E1_MAX: 3,
	E2: 4,
	E2_MAX: 5
}

class Operator {
	constructor(name, opClass, rarity, e1_mats, e2_mats) {
		this.name = name;
		this.opClass = opClass;
		this.rarity = rarity;
		this.e1_mats = e1_mats;
		this.e2_mats = e2_mats;

		// Calculate upgrade chips needed
		if (rarity >= 4) {
			this.e1_mats[`${CLASS_TO_STRING[this.opClass]} Chip`] = (rarity - 1);
		}
		
		if (rarity == 4) {
			this.e2_mats[`${CLASS_TO_STRING[this.opClass]} Chip Pack`] = 5;
		}
		else if (rarity == 5) {
			this.e2_mats[`${CLASS_TO_STRING[this.opClass]} Dualchip`] = 3;
		}
		else if (rarity == 6) {
			this.e2_mats[`${CLASS_TO_STRING[this.opClass]} Dualchip`] = 4;
		}
	}

	getClass_toString() {
		return CLASS_TO_STRING[this.opClass];
	}

	getRarity_toString() {
		return `(${this.rarity}) ${"★".repeat(this.rarity)}`
	}

	checkEnoughMaterials(matList, rank) {
		if (rank == 1) {
			for(const ingredient in this.e1_mats) {
				if ((ingredient in matList) == false || 
					matList[ingredient].has < this.e1_mats[ingredient]) {
					return false;
				}
			}
		}
		else if (rank == 2) {
			for(const ingredient in this.e2_mats) {
				if ((ingredient in matList) == false || 
					matList[ingredient].has < this.e2_mats[ingredient]) {
					return false;
				}
			}
		}
		else {
			return false;
		}
		return true;
	}
}

class OperatorEntry {
	constructor(operator, level, rank) {
		this.operator = operator;
		this.level = level;
		this.rank = rank;
		this.goalRank = this.getMaxRank();
		this.goalLevel = this.getMaxLevel(this.goalRank);
	}

	getMaxLevel(rank=0) {
		const rank0_levels = [30, 30, 40, 45, 50, 50];
		const rank1_levels = [ 0,  0, 55, 60, 70, 80];
		const rank2_levels = [ 0,  0,  0, 70, 80, 90];
		let maxLevel = rank0_levels[this.operator.rarity - 1];

		if (rank === 2) {
			maxLevel = rank2_levels[this.operator.rarity - 1];
		}
		else if (rank === 1) {
			maxLevel = rank1_levels[this.operator.rarity - 1];
		}
		return maxLevel;
	}

	getMaxRank() {
		const maxRanks = [0, 0, 1, 2, 2, 2];
		return maxRanks[this.operator.rarity - 1];
	}

	getGoalMet() {
		return (this.rank >= this.goalRank) && (this.level >= this.goalLevel)
	}

	getGrowthState() {
		if (this.rank == 0) {
			if (this.level == this.getMaxLevel(this.rank)) {
				return GROWTH_STATE.E0_MAX;
			}
			else {
				return GROWTH_STATE.E0;
			}
		}
		else if (this.rank == 1) {
			if (this.level == this.getMaxLevel(this.rank)) {
				return GROWTH_STATE.E1_MAX;
			}
			else {
				return GROWTH_STATE.E1;
			}
		}
		else if (this.rank == 2) {
			if (this.level == this.getMaxLevel(this.rank)) {
				return GROWTH_STATE.E2_MAX;
			}
			else {
				return GROWTH_STATE.E2;
			}
		}
	}
} 

const operatorList = [
	// 1 Star
	new Operator("Castle-3",        CLASS.GUARD,      1, {}, {}),
	new Operator("Justice Knight",  CLASS.SNIPER,     1, {}, {}),
	new Operator("Lancet-2",        CLASS.MEDIC,      1, {}, {}),
	new Operator("THRM-EX",         CLASS.SPECIALIST, 1, {}, {}),

	// 2 Star
	new Operator("12F",             CLASS.CASTER,     2, {}, {}),
	new Operator("Durin",           CLASS.CASTER,     2, {}, {}),
	new Operator("Noir Corne",      CLASS.DEFENDER,   2, {}, {}),
	new Operator("Rangers",         CLASS.SNIPER,     2, {}, {}),
	new Operator("Yato",            CLASS.GUARD,      2, {}, {}),

	// 3 Star
	new Operator("Adnachiel",       CLASS.SNIPER,     3, {}, {}),
	new Operator("Ansel",           CLASS.MEDIC,      3, {}, {}),
	new Operator("Beagle",          CLASS.DEFENDER,   3, {}, {}),
	new Operator("Cardigan",        CLASS.DEFENDER,   3, {}, {}),
	new Operator("Catapult",        CLASS.SNIPER,     3, {}, {}),
	new Operator("Fang",            CLASS.VANGUARD,   3, {}, {}),
	new Operator("Hibiscus",        CLASS.MEDIC,      3, {}, {}),
	new Operator("Kroos",           CLASS.SNIPER,     3, {}, {}),
	new Operator("Lava",            CLASS.CASTER,     3, {}, {}),
	new Operator("Melantha",        CLASS.GUARD,      3, {}, {}),
	new Operator("Midnight",        CLASS.GUARD,      3, {}, {}),
	new Operator("Orchid",          CLASS.SUPPORTER,  3, {}, {}),
	new Operator("Plume",           CLASS.VANGUARD,   3, {}, {}),
	new Operator("Popukar",         CLASS.GUARD,      3, {}, {}),
	new Operator("Spot",            CLASS.DEFENDER,   3, {}, {}),
	new Operator("Steward",         CLASS.CASTER,     3, {}, {}),
	new Operator("Vanilla",         CLASS.VANGUARD,   3, {}, {}),

	// 4 Star
	new Operator("Aciddrop",        CLASS.SNIPER,       4, {"Device": 1, "Orirock Cube": 1},    {"RMA70-24": 10, "Integrated Device": 8}),
	new Operator("Ambriel",         CLASS.SNIPER,       4, {"Polyketon": 1, "Orirock Cube": 1}, {"Oriron Cluster": 16, "RMA70-12": 6}),
	new Operator("Arene",           CLASS.GUARD,        4, {"Orirock": 1, "Polyketon": 1},      {"Orirock Cluster": 21, "Integrated Device": 7}),
	new Operator("Beanstalk",       CLASS.VANGUARD,     4, {"Oriron": 1, "Sugar": 1},            {"Coagulating Gel": 13, "Manganese Ore": 10}),
	new Operator("Beehunter",       CLASS.GUARD,        4, {"Device": 1, "Orirock Cube": 1},    {"Sugar Pack": 19, "RMA70-12": 7}),
	new Operator("Bubble",          CLASS.DEFENDER,     4, {"Sugar": 1, "Device": 1},           {"Coagulating Gel": 16, "Loxic Kohl": 8}),
	new Operator("Click",           CLASS.CASTER,       4, {"Oriron": 1, "Polyketon": 1},        {"Manganese Ore": 15, "Oriron Cluster": 9}),
	new Operator("Conviction",      CLASS.GUARD,        4, {"Sugar": 1, "Polyester": 1},        {"Integrated Device": 11, "Coagulating Gel": 9}),
	new Operator("Courier",         CLASS.VANGUARD,     4, {"Device": 1, "Sugar": 1},           {"Integrated Device": 11, "Aketon": 10}),
	new Operator("Cuora",           CLASS.DEFENDER,     4, {"Orirock Cube": 1, "Oriron": 1},     {"Grindstone": 14, "Loxic Kohl": 10}),
	new Operator("Cutter",          CLASS.GUARD,        4, {"Polyester": 1, "Polyketon": 1},    {"Coagulating Gel": 12, "Manganese Ore": 11}),
	new Operator("Deepcolor",       CLASS.SUPPORTER,    4, {"Polyester": 1, "Device": 1},       {"Orirock Cluster": 20, "Manganese Ore": 9}),
	new Operator("Dobermann",       CLASS.GUARD,        4, {"Sugar": 1, "Polyester": 1},        {"Manganese Ore": 15, "Loxic Kohl": 11}),
	new Operator("Dur-nar",         CLASS.DEFENDER,     4, {"Orirock Cube": 1, "Polyester": 1}, {"Orirock Cluster": 19, "RMA70-12": 8}),
	new Operator("Earthspirit",     CLASS.SUPPORTER,    4, {"Oriron": 1, "Orirock Cube": 1},     {"Sugar Pack": 20, "Grindstone": 7}),
	new Operator("Estelle",         CLASS.GUARD,        4, {"Oriron": 1, "Polyketon": 1},        {"RMA70-12": 12, "Grindstone": 8}),
	new Operator("Ethan",           CLASS.SPECIALIST,   4, {"Sugar": 1, "Oriron": 1},            {"Sugar Pack": 17, "Orirock Cluster": 14}),
	new Operator("Frostleaf",       CLASS.GUARD,        4, {"Polyester": 1, "Oriron": 1},        {"Grindstone": 15, "Manganese Ore": 7}),
	new Operator("Gavial",          CLASS.MEDIC,        4, {"Oriron": 1, "Sugar": 1},            {"Integrated Device": 13, "Oriron Cluster": 6}),
	new Operator("Gitano",          CLASS.CASTER,       4, {"Sugar": 1, "Oriron": 1},            {"Sugar Pack": 17, "Orirock Cluster": 14}),
	new Operator("Gravel",          CLASS.SPECIALIST,   4, {"Orirock Cube": 1, "Polyketon": 1}, {"Polyester Pack": 18, "Orirock Cluster": 13}),
	new Operator("Greyy",           CLASS.CASTER,       4, {"Oriron": 1, "Polyester": 1},        {"Manganese Ore": 15, "Aketon": 9}),
	new Operator("Gummy",           CLASS.DEFENDER,     4, {"Sugar": 1, "Polyketon": 1},        {"RMA70-12": 13, "Manganese Ore": 7}),
	new Operator("Haze",            CLASS.CASTER,       4, {"Orirock Cube": 1, "Polyester": 1}, {"Orirock Cluster": 19, "RMA70-12": 8}),
	new Operator("Indigo",          CLASS.CASTER,       4, {"Device": 1, "Oriron": 1},           {"Oriron Cluster": 14, "RMA70-12": 7}),
	new Operator("Jackie",          CLASS.GUARD,        4, {"Polyester": 1, "Orirock Cube": 1}, {"Orirock Cluster": 19, "Loxic Kohl": 12}),
	new Operator("Jaye",            CLASS.SPECIALIST,   4, {"Polyketon": 1, "Device": 1},       {"Grindstone": 14, "Aketon": 8}),
	new Operator("Jessica",         CLASS.SNIPER,       4, {"Polyester": 1, "Sugar": 1},         {"Loxic Kohl": 20, "Oriron Cluster": 7}),
	new Operator("Matoimaru",       CLASS.GUARD,        4, {"Orirock Cube": 1, "Device": 1},    {"Aketon": 16, "Sugar Pack": 10}),
	new Operator("Matterhorn",      CLASS.DEFENDER,     4, {"Device": 1, "Oriron": 1},           {"Manganese Ore": 14, "Integrated Device": 7}),
	new Operator("May",             CLASS.SNIPER,       4, {"Oriron": 1, "Device": 1},           {"Oriron Cluster": 14, "Polyester Pack": 12}),
	new Operator("Meteor",          CLASS.SNIPER,       4, {"Oriron": 1, "Device": 1},           {"Oriron Cluster": 14, "Polyester Pack": 12}),
	new Operator("Mousse",          CLASS.GUARD,        4, {"Polyketon": 1, "Device": 1},       {"Orirock Cluster": 20, "Grindstone": 8}),
	new Operator("Myrrh",           CLASS.MEDIC,        4, {"Polyester": 1, "Orirock Cube": 1}, {"Aketon": 14, "Polyester Pack": 12}),
	new Operator("Myrtle",          CLASS.VANGUARD,     4, {"Polyketon": 1, "Oriron": 1},        {"Grindstone": 12, "Integrated Device": 8}),
	new Operator("Perfumer",        CLASS.MEDIC,        4, {"Polyketon": 1, "Polyester": 1},    {"Loxic Kohl": 19, "Aketon": 8}),
	new Operator("Pinecone",        CLASS.SNIPER,       4, {"Polyketon": 1, "Polyester": 1},    {"Incandescent Alloy": 16, "Grindstone": 8}),
	new Operator("Podenco",         CLASS.SUPPORTER,    4, {"Polyester": 1, "Oriron": 1},        {"Incandescent Alloy": 15, "Grindstone": 5}),
	new Operator("Pudding",         CLASS.CASTER,       4, {"Sugar": 1, "Polyketon": 1},        {"RMA70-12": 11, "Pure Lubricant": 3}),
	new Operator("Purestream",      CLASS.MEDIC,        4, {"Orirock Cube": 1, "Sugar": 1},     {"Integrated Device": 11, "Coagulating Gel": 9}),
	new Operator("Roberta",         CLASS.SUPPORTER,    4, {"Orirock": 1, "Oriron": 1},          {"Semi-Organic Solvent": 14, "Integrated Device": 7}),
	new Operator("Rope",            CLASS.SPECIALIST,   4, {"Sugar": 1, "Device": 1},           {"Oriron Cluster": 15, "Sugar Pack": 11}),
	new Operator("Scavenger",       CLASS.VANGUARD,     4, {"Orirock Cube": 1, "Sugar": 1},     {"Loxic Kohl": 20, "Integrated Device": 6}),
	new Operator("Shaw",            CLASS.SPECIALIST,   4, {"Sugar": 1, "Orirock Cube": 1},     {"Integrated Device": 12, "Polyester Pack": 11}),
	new Operator("ShiraYuki",       CLASS.SNIPER,       4, {"Polyketon": 1, "Orirock Cube": 1}, {"Aketon": 15, "Oriron Cluster": 9}),
	new Operator("Sussurro",        CLASS.MEDIC,        4, {"Device": 1, "Polyketon": 1},       {"RMA70-12": 10, "Loxic Kohl": 11}),
	new Operator("Utage",           CLASS.GUARD,        4, {"Device": 1, "Sugar": 1},           {"Aketon": 14, "Orirock Cluster": 14}),
	new Operator("Vermeil",         CLASS.SNIPER,       4, {"Polyester": 1, "Polyketon": 1},    {"Polyester Pack": 18, "Sugar Pack": 12}),
	new Operator("Vigna",           CLASS.VANGUARD,     4, {"Device": 1, "Polyester": 1},       {"Oriron Cluster": 16, "Orirock Cluster": 11}),

	// 5 Star
	new Operator("Absinthe",        CLASS.CASTER,       5, {"Orirock Cube": 6, "Polyester": 3}, {"Orirock Concentration": 10, "Incandescent Alloy Block": 10}),
	new Operator("Akafuyu",         CLASS.GUARD,        5, {"Orirock Cube": 7, "Oriron": 3},     {"Polymerized Gel": 8, "Aketon": 15}),
	new Operator("Amiya",           CLASS.CASTER,       5, {"Device": 4, "Oriron": 4},           {"Orirock Concentration": 10, "Loxic Kohl": 10}),
	new Operator("Amiya (Guard)",   CLASS.GUARD,        5, {"": 1, "": 1}, {"": 1, "": 1}),
	new Operator("Andreana",        CLASS.SNIPER,       5, {"Orirock Cube": 8, "Sugar": 2},     {"Grindstone Pentahydrate": 8, "RMA70-12": 8}),
	new Operator("Aosta",           CLASS.SNIPER,       5, {"Device": 3, "Orirock Cube": 4},    {"Oriron Block": 7, "Incandescent Alloy Block": 10}),
	new Operator("April",           CLASS.SNIPER,       5, {"Oriron": 4, "Polyketon": 2},        {"Polymerized Gel": 9, "RMA70-12": 9}),
	new Operator("Asbestos",        CLASS.DEFENDER,     5, {"Polyketon": 4, "Oriron": 3},        {"Optimized Device": 6, "Manganese Ore": 10}),
	new Operator("Ashlock",         CLASS.DEFENDER,     5, {"Orirock Cube": 7, "Device": 2},    {"Polymerized Gel": 8, "Compound Lubricant": 13}),
	new Operator("Astesia",         CLASS.GUARD,        5, {"Polyester": 5, "Oriron": 3},        {"Polyester Lump": 7, "Oriron Cluster": 14}),
	new Operator("Aurora",          CLASS.DEFENDER,     5, {"Device": 3, "Polyketon": 2},       {"White Horse Kohl": 9, "Orirock Cluster": 19}),
	new Operator("Ayerscarpe",      CLASS.GUARD,        5, {"Sugar": 3, "Oriron": 4},            {"Oriron Block": 6, "Coagulating Gel": 12}),
	new Operator("Beeswax",         CLASS.CASTER,       5, {"Oriron": 4, "Device": 2},           {"Optimized Device": 5, "Loxic Kohl": 18}),
	new Operator("Bena",            CLASS.SPECIALIST,   5, {"Polyester": 5, "Device": 2},       {"Oriron Block": 6, "Loxic Kohl": 15}),
	new Operator("Bibeak",          CLASS.GUARD,        5, {"Oriron": 4, "Orirock Cube": 3},     {"Manganese Trihydrate": 8, "RMA70-12": 8}),
	new Operator("Bison",           CLASS.DEFENDER,     5, {"Polyester": 5, "Orirock Cube": 4}, {"Grindstone Pentahydrate": 7, "RMA70-12": 11}),
	new Operator("Blacknight",      CLASS.VANGUARD,     5, {"Oriron": 4, "Device": 2},           {"Incandescent Alloy Block": 8, "Loxic Kohl": 15}),
	new Operator("Blitz",           CLASS.DEFENDER,     5, {"Sugar": 5, "Device": 2},           {"Manganese Trihydrate": 8, "RMA70-12": 8}),
	new Operator("Blue Poison",     CLASS.SNIPER,       5, {"Polyester": 5, "Orirock Cube": 4}, {"Manganese Trihydrate": 8, "Integrated Device": 8}),
	new Operator("Breeze",          CLASS.MEDIC,        5, {"Device": 3, "Orirock Cube": 4},    {"Optimized Device": 5, "Loxic Kohl": 18}),
	new Operator("Broca",           CLASS.GUARD,        5, {"Device": 4, "Oriron": 4},           {"Sugar Lump": 7, "Grindstone": 13}),
	new Operator("Ceylon",          CLASS.MEDIC,        5, {"Oriron": 4, "Polyketon": 2},        {"Oriron Block": 7, "Aketon": 10}),
	new Operator("Chiave",          CLASS.VANGUARD,     5, {"Device": 3, "Sugar": 3},           {"Manganese Trihydrate": 7, "Grindstone": 13}),
	new Operator("Cliffheart",      CLASS.SPECIALIST,   5, {"Orirock Cube": 6, "Polyester": 3}, {"Oriron Block": 6, "Manganese Ore": 13}),
	new Operator("Corroserum",      CLASS.CASTER,       5, {"Polyketon": 4, "Oriron": 3},        {"Optimized Device": 5, "RMA70-12": 10}),
	new Operator("Croissant",       CLASS.DEFENDER,     5, {"Polyester": 4, "Sugar": 3},        {"RMA70-24": 8, "Integrated Device": 8}),
	new Operator("Elysium",         CLASS.VANGUARD,     5, {"Polyester": 4, "Sugar": 3},        {"Incandescent Alloy Block": 7, "Aketon": 16}),
	new Operator("Executor",        CLASS.SNIPER,       5, {"Sugar": 5, "Device": 2},           {"Manganese Trihydrate": 8, "Grindstone": 9}),
	new Operator("FEater",          CLASS.GUARD,        5, {"Device": 3, "Sugar": 3},           {"Grindstone Pentahydrate": 8, "Polyester Pack": 15}),
	new Operator("Firewatch",       CLASS.SNIPER,       5, {"Device": 3, "Polyketon": 2},       {"Polyester Lump": 7, "Loxic Kohl": 15}),
	new Operator("Flamebringer",    CLASS.GUARD,        5, {"Orirock": 6, "Polyketon": 3},      {"White Horse Kohl": 9, "Manganese Ore": 13}),
	new Operator("Flint",           CLASS.GUARD,        5, {"Polyester": 5, "Oriron": 3},        {"Orirock Cluster": 8, "Grindstone": 15}),
	new Operator("Folinic",         CLASS.MEDIC,        5, {"Polyester": 5, "Polyketon": 2},    {"Keton Colloid": 8, "Integrated Device": 8}),
	new Operator("Franka",          CLASS.GUARD,        5, {"Oriron": 4, "Polyketon": 2},        {"Oriron Block": 6, "Sugar Pack": 18}),
	new Operator("Frost",           CLASS.SPECIALIST,   5, {"Polyester": 5, "Orirock Cube": 4}, {"Grindstone Pentahydrate": 8, "Orirock Cluster": 17}),
	new Operator("Glaucus",         CLASS.SUPPORTER,    5, {"Polyketon": 4, "Device": 2},       {"Keton Colloid": 7, "Integrated Device": 10}),
	new Operator("Grani",           CLASS.VANGUARD,     5, {"Orirock Cube": 8, "Sugar": 8},     {"RMA70-24": 7, "Oriron Cluster": 13}),
	new Operator("GreyThroat",      CLASS.SNIPER,       5, {"Orirock Cube": 7, "Oriron": 3},     {"Oriron Block": 7, "Integrated Device": 9}),
	new Operator("Heavyrain",       CLASS.DEFENDER,     5, {"Device": 4, "Oriron": 4},           {"Orirock Concentration": 9, "Oriron Cluster": 14}),
	new Operator("Honeyberry",      CLASS.MEDIC,        5, {"Polyester": 4, "Sugar": 3},        {"Refined Solvent": 7, "Integrated Device": 12}),
	new Operator("Hung",            CLASS.DEFENDER,     5, {"Polyester": 5, "Device": 2},       {"Incandescent Alloy Block": 7, "Aketon": 15}),
	new Operator("Indra",           CLASS.GUARD,        5, {"Polyketon": 4, "Device": 2},       {"Keton Colloid": 7, "Polyester Pack": 16}),
	new Operator("Iris",            CLASS.CASTER,       5, {"Oriron": 4, "Polyketon": 2},       {"Oriron Block": 6, "Integrated Device": 11}),
	new Operator("Istina",          CLASS.SUPPORTER,    5, {"Polyester": 5, "Polyketon": 2},    {"Optimized Device": 5, "RMA70-12": 9}),
	new Operator("Kafka",           CLASS.SPECIALIST,   5, {"Sugar": 4, "Polyester": 3},        {"Polymerized Gel": 8, "Oriron Cluster": 15}),
	new Operator("Kirara",          CLASS.SPECIALIST,   5, {"Sugar": 4, "Polyketon": 3},        {"Incandescent Alloy Block": 7, "Integrated Device": 11}),
	new Operator("Kjera",           CLASS.CASTER,       5, {"Sugar": 4, "Oriron": 3},           {"Grindstone Pentahydrate": 8, "Incandescent Alloy": 13}),
	new Operator("Kroos the Keen Glint", CLASS.SNIPER,  5, {"Sugar": 5, "Polyketon": 2},        {"Crystalline Circuit": 7, "Oriron Cluster": 10}),
	new Operator("La Pluma",        CLASS.GUARD,        5, {"Oriron": 4, "Orirock Cube": 3},    {"Keton Colloid": 7, "Manganese Ore": 13}),
	new Operator("Lappland",        CLASS.GUARD,        5, {"Device": 3, "Orirock Cube": 4},    {"Optimized Device": 6, "Oriron Cluster": 10}),
	new Operator("Lava the Purgatory", CLASS.CASTER,    5, {"Orirock Cube": 6, "Polyketon": 3}, {"White Horse Kohl": 8, "Grindstone": 13}),
	new Operator("Leizi",           CLASS.CASTER,       5, {"Device": 3, "Polyester": 3},       {"RMA70-24": 7, "Coagulating Gel": 13}),
	new Operator("Leonhardt",       CLASS.CASTER,       5, {"Oriron": 4, "Polyester": 3},       {"Keton Colloid": 7, "Loxic Kohl": 15}),
	new Operator("Liskarm",         CLASS.DEFENDER,     5, {"Sugar": 5, "Orirock Cube": 3},     {"Grindstone Pentahydrate": 7, "Aketon": 15}),
	new Operator("Manticore",       CLASS.SPECIALIST,   5, {"Polyketon": 4, "Orirock Cube": 4}, {"Manganese Trihydrate": 8, "Sugar Pack": 12}),
	new Operator("Mayer",           CLASS.SUPPORTER,    5, {"Polyester": 5, "Device": 2},       {"Oriron Block": 6, "RMA70-12": 11}),
	new Operator("Meteorite",       CLASS.SNIPER,       5, {"Polyketon": 4, "Polyester": 3},    {"RMA70-24": 7, "Manganese Ore": 14}),
	new Operator("Mint",            CLASS.CASTER,       5, {"Polyketon": 4, "Device": 2},       {"Incandescent Alloy Block": 9, "Orirock Cluster": 14}),
	new Operator("Mr. Nothing",     CLASS.SPECIALIST,   5, {"Device": 3, "Orirock Cube": 4},    {"Optimized Device": 6, "Manganese Ore": 10}),
	new Operator("Mulberry",        CLASS.MEDIC,        5, {"Device": 3, "Polyester": 3},       {"Orirock Concentration": 9, "Semi-Organic Solvent": 12}),
	new Operator("Nearl",           CLASS.DEFENDER,     5, {"Device": 3, "Polyester": 3},       {"White Horse Kohl": 9, "Polyester Pack": 16}),
	new Operator("Nightmare",       CLASS.CASTER,       5, {"Orirock Cube": 7, "Oriron": 3},    {"Sugar Kump": 7, "Manganese Ore": 14}),
	new Operator("Nine-Colored Deer", CLASS.SUPPORTER,  5, {"Orirock Cube": 6, "Polyester": 3}, {"Manganese Trihydrate": 7, "Crystalline Component": 14}),
	new Operator("Platinum",        CLASS.SNIPER,       5, {"Oriron": 4, "Sugar": 3},           {"Grindstone Pentahydrate": 8, "Loxic Kohl": 15}),
	new Operator("Pramanix",        CLASS.SUPPORTER,    5, {"Sugar": 4, "Oriron": 3},           {"Keton Colloid": 7, "Grindstone": 11}),
	new Operator("Projekt Red",     CLASS.SPECIALIST,   5, {"Orirock Cube": 7, "Device": 2},    {"Manganese Trihydrate": 7, "Oriron Cluster": 14}),
	new Operator("Provence",        CLASS.SNIPER,       5, {"Polyketon": 4, "Oriron": 3},       {"Sugar Lump": 9, "Integrated Device": 7}),
	new Operator("Ptilopsis",       CLASS.MEDIC,        5, {"Orirock Cube": 8, "Sugar": 2},     {"Orirock Concentration": 9, "Grindstone": 10}),
	new Operator("Quercus",         CLASS.SUPPORTER,    5, {"Polyketon": 4, "Orirock Cube": 4}, {"Oriron Block": 6, "Manganese Ore": 13}),
	new Operator("Reed",            CLASS.VANGUARD,     5, {"Polyketon": 4, "Polyester": 4},    {"Orirock Concentration": 9, "Manganese Ore": 12}),
	new Operator("Robin",           CLASS.SPECIALIST,   5, {"Polyester": 5, "Oriron": 3},       {"Incandescent Alloy Block": 8, "Aketon": 11}),
	new Operator("Savage",          CLASS.GUARD,        5, {"Sugar": 4, "Polyester": 3},        {"Orirock Concentration": 9, "Sugar Pack": 18}),
	new Operator("Scene",           CLASS.SUPPORTER,    5, {"Polyketon": 4, "Orirock Cube": 4}, {"White Horse Kohl": 9, "Manganese Ore": 12}),
	new Operator("Sesa",            CLASS.SNIPER,       5, {"Polyketon": 4, "Sugar": 2},        {"Grindstone Pentahydrate": 8, "Orirock Cluster": 18}),
	new Operator("Shalem",          CLASS.DEFENDER,     5, {"Polyester": 5, "Polyketon": 2},    {"RMA70-24": 7, "Coagulating Gel": 11}),
	new Operator("Shamare",         CLASS.SUPPORTER,    5, {"Sugar": 5, "Orirock Cube": 3},     {"Orirock Concentration": 8, "Incandescent Alloy": 17}),
	new Operator("Sideroca",        CLASS.GUARD,        5, {"Orirock Cube": 7, "Device": 2},    {"Polymerized Gel": 9, "Oriron Cluster": 13}),
	new Operator("Silence",         CLASS.MEDIC,        5, {"Oriron": 4, "Orirock Cube": 3},    {"Keton Colloid": 7, "Orirock Cluster": 18}),
	new Operator("Skyfire",         CLASS.CASTER,       5, {"Sugar": 4, "Polyketon": 3},        {"Polyester Lump": 7, "Grindstone": 13}),
	new Operator("Snowsant",        CLASS.SPECIALIST,   5, {"Sugar": 4, "Polyketon": 3},        {"Polymerized Gel": 8, "Oriron Cluster": 15}),
	new Operator("Sora",            CLASS.SUPPORTER,    5, {"Oriron": 4, "Device": 2},          {"White Horse Kohl": 9, "Orirock Cluster": 17}),
	new Operator("Specter",         CLASS.GUARD,        5, {"Orirock Cube": 6, "Polyketon": 3}, {"White Horse Kohl": 8, "Aketon": 15}),
	new Operator("Swire",           CLASS.GUARD,        5, {"Sugar": 5, "Device": 2},           {"Sugar Lump": 7, "Polyester Pack": 17}),
	new Operator("Tachanka",        CLASS.GUARD,        5, {"Oriron": 4, "Sugar": 3},           {"RMA70-24": 7, "Coagulating Gel": 12}),
	new Operator("Tequila",         CLASS.GUARD,        5, {"Polyketon": 4, "Sugar": 2},        {"Optimized Device": 5, "Grindstone": 11}),
	new Operator("Texas",           CLASS.VANGUARD,     5, {"Polyester": 5, "Oriron": 3},       {"Polyester Lump": 8, "Orirock Cluster": 16}),
	new Operator("Toddifons",       CLASS.SNIPER,       5, {"Polyketon": 4, "Polyester": 3},    {"Crystalline Circuit": 10, "Incandescent Alloy": 10}),
	new Operator("Tomimi",          CLASS.CASTER,       5, {"Sugar": 4, "Polyester": 3},        {"RMA70-24": 8, "Orirock Cluster": 14}),
	new Operator("Tsukinogi",       CLASS.SUPPORTER,    5, {"Device": 3, "Polyketon": 2},       {"White Horse Kohl": 8, "Grindstone": 12}),
	new Operator("Tuye",            CLASS.MEDIC,        5, {"Polyketon": 4, "Device": 2},       {"Keton Colloid": 7, "White Horse Kohl": 15}),
	new Operator("Vulcan",          CLASS.DEFENDER,     5, {"Oriron": 4, "Polyester": 3},       {"Orirock Concentration": 8, "Aketon": 15}),
	new Operator("Waai Fu",         CLASS.SPECIALIST,   5, {"Oriron": 4, "Sugar": 3},           {"RMA70-24": 7, "Orirock Cluster": 16}),
	new Operator("Warfarin",        CLASS.MEDIC,        5, {"Polyketon": 4, "Sugar": 2},        {"Optimized Device": 5, "Sugar Pack": 17}),
	new Operator("Whislash",        CLASS.GUARD,        5, {"Orirock Cube": 6, "Polyketon": 3}, {"Keton Colloid": 7, "Coagulating Gel": 12}),
	new Operator("Whisperain",      CLASS.MEDIC,        5, {"Orirock Cube": 8, "Sugar": 2},     {"Orirock Concentration": 9, "Crystalline Component": 13}),
	new Operator("Wild Mane",       CLASS.VANGUARD,     5, {"Sugar": 5, "Orirock Cube": 3},     {"Pure Lubricant": 8, "Aketon": 11}),
	new Operator("Zima",            CLASS.VANGUARD,     5, {"Sugar": 4, "Polyester": 3},        {"Sugar Lump": 7, "RMA70-12": 11}),

	// 6 Star
	new Operator("Aak",             CLASS.SPECIALIST,   6, {"Sugar": 8, "Oriron": 5},            {"D32 Steel": 4, "Polymerized Gel": 7}),
	new Operator("Angelina",        CLASS.SUPPORTER,    6, {"Polyketon": 7, "Sugar": 4},        {"Bipolar Nanoflake": 4, "Sugar Lump": 5}),
    new Operator("Archetto",        CLASS.SNIPER,       6, {"Oriron": 7, "Sugar": 5},            {"Polymerization Preparation": 4, "Orirock Concentration": 8}),
	new Operator("Ash",             CLASS.SNIPER,       6, {"Orirock Cube": 11, "Oriron": 5},    {"D32 Steel": 4, "Polymerized Gel": 6}),
	new Operator("Bagpipe",         CLASS.VANGUARD,     6, {"Polyester": 10, "Polyketon": 3},   {"Polymerization Preparation": 4, "Orirock Concentration": 9}),
	new Operator("Blaze",           CLASS.GUARD,        6, {"Device": 5, "Polyketon": 4},       {"D32 Steel": 4, "Optimized Device": 6}),
	new Operator("Blemishine",      CLASS.DEFENDER,     6, {"Device": 5, "Orirock Cube": 7},    {"D32 Steel": 4, "RMA70-24": 7}),
	new Operator("Carnelian",       CLASS.CASTER,       6, {"Device": 5, "Polyester": 5},       {"D32 Steel": 4, "RMA70-24": 7}),
	new Operator("Ceobe",           CLASS.CASTER,       6, {"Oriron": 3, "Device": 5},           {"Bipolar Nanoflake": 4, "Incandescent Alloy Block": 5}),
	new Operator("Ch'en",           CLASS.GUARD,        6, {"Orirock Cube": 12, "Device": 3},   {"Polymerization Preparation": 4, "White Horse Kohl": 6}),
	new Operator("Ch'en the Holungday", CLASS.SNIPER,   6, {"Polyester": 8, "Sugar": 6},        {"Bipolar Nanoflake": 4, "Incandescent Alloy Block": 6}),
	new Operator("Dusk",            CLASS.CASTER,       6, {"Device": 6, "Oriron": 3},           {"Crystalline Electronic Unit": 4, "Manganese Trihydrate": 6}),
	new Operator("Eunectes",        CLASS.DEFENDER,     6, {"Polyketon": 7, "Device": 3},       {"Bipolar Nanoflake": 4, "Polymerized Gel": 7}),
	new Operator("Exusiai",         CLASS.SNIPER,       6, {"Orirock Cube": 12, "Polyketon": 4}, {"Polymerization Preparation": 4, "Sugar Lump": 5}),
	new Operator("Eyjafjalla",      CLASS.CASTER,       6, {"Oriron": 7, "Sugar": 5},            {"Polymerization Preparation": 4, "Optimized Device": 5}),
	new Operator("Fartooth",        CLASS.GUARD,        6, {"Polyketon": 7, "Oriron": 4},        {"D32 Steel": 4, "Pure Lubricant": 7}),
	new Operator("Flametail",       CLASS.VANGUARD,     6, {"Orirock Cube": 12, "Polyester": 5}, {"Bipolar Nanoflake": 4, "Orirock Concentration": 9}),
	new Operator("Gladiia",         CLASS.SPECIALIST,   6, {"Polyketon": 7, "Sugar": 4},        {"Crystalline Electronic Unit": 4, "Polymerized Gel": 6}),
	new Operator("Gnosis",          CLASS.SUPPORTER,    6, {"Sugar": 8, "Oriron": 5},            {"Crystalline Electronic Unit": 4, "Incandescent Alloy Block": 7}),
	new Operator("Goldenglow",      CLASS.CASTER,       6, {"Polyketon": 7, "Orirock Cube": 7}, {"Bipolar Nanoflake": 4, "Manganese Trihydrate": 5}),
	new Operator("Hellagur",        CLASS.GUARD,        6, {"Sugar": 10, "Orirock Cube": 6},    {"Bipolar Nanoflake": 4, "Polyester Pack": 7}),
	new Operator("Hoshiguma",       CLASS.DEFENDER,     6, {"Orirock Cube": 11, "Oriron": 5},    {"Polymerization Preparation": 4, "Grindstone Pentahydrate": 5}),
	new Operator("Ifrit",           CLASS.CASTER,       6, {"Polyester": 8, "Orirock Cube": 8}, {"D32 Steel": 4, "Polyester Lump": 7}),
	new Operator("Kal'tsit",        CLASS.MEDIC,        6, {"Sugar": 8, "Polyketon": 5},        {"Crystalline Electronic Unit": 4, "Optimized Device": 4}),
	new Operator("Lee",             CLASS.SPECIALIST,   6, {"Oriron": 8, "Device": 3},           {"Polymerization Preparation": 4, "White Horse Kohl": 9}),
	new Operator("Ling",            CLASS.SUPPORTER,    6, {"Polyester": 10, "Polyketon": 3},   {"D32 Steel": 4, "Crystalline Circuit": 5}),
	new Operator("Magallan",        CLASS.SUPPORTER,    6, {"Oriron": 7, "Polyester": 4},        {"Polymerization Preparation": 4, "Manganese Trihydrate": 6}),
	new Operator("Mizuki",          CLASS.SPECIALIST,   6, {"Sugar": 10, "Orirock Cube": 6},    {"Polymerization Preparation": 4, "Crystalline Circuit": 6}),
	new Operator("Mostima",         CLASS.CASTER,       6, {"Polyketon": 7, "Oriron": 4},        {"Bipolar Nanoflake": 4, "Grindstone Pentahydrate": 7}),
	new Operator("Mountain",        CLASS.GUARD,        6, {"Polyester": 8, "Orirock Cube": 8}, {"Crystalline Electronic Unit": 4, "Polymerized Gel": 8}),
	new Operator("Mudrock",         CLASS.DEFENDER,     6, {"Orirock Cube": 12, "Polyketon": 4}, {"Crystalline Electronic Unit": 4, "Incandescent Alloy Block": 5}),
	new Operator("Nearl the Radiant Knight", CLASS.GUARD, 6, {"Device": 5, "Polyketon": 4},     {"Polymerization Preparation": 4, "Polymerized Gel": 8}),
	new Operator("Nian",            CLASS.DEFENDER,     6, {"Orirock Cube": 12, "Polyester": 5}, {"Polymerization Preparation": 4, "Incandescent Alloy Block": 7}),
	new Operator("Nightingale",     CLASS.MEDIC,        6, {"Device": 6, "Oriron": 3},           {"D32 Steel": 4, "Keton Colloid": 6}),
	new Operator("Pallas",          CLASS.GUARD,        6, {"Orirock Cube": 12, "Device": 5},   {"Crystalline Electronic Unit": 4, "White Horse Kohl": 6}),
	new Operator("Passenger",       CLASS.CASTER,       6, {"Oriron": 8, "Orirock Cube": 5},     {"Bipolar Nanoflake": 4, "Oriron Block": 5}),
	new Operator("Phantom",         CLASS.SPECIALIST,   6, {"Polyketon": 7, "Orirock Cube": 7}, {"Polymerization Preparation": 4, "Polymerized Gel": 9}),
	new Operator("Rosa",            CLASS.SNIPER,       6, {"Sugar": 8, "Polyester": 5},        {"Bipolar Nanoflake": 4, "Optimized Device": 6}),
	new Operator("Rosmontis",       CLASS.SNIPER,       6, {"Sugar": 9, "Device": 5},           {"D32 Steel": 4, "Keton Colloid": 5}),
	new Operator("Saga",            CLASS.VANGUARD,     6, {"Polyketon": 6, "Polyester": 5},    {"Bipolar Nanoflake": 4, "Incandescent Alloy Block": 6}),
	new Operator("Saileach",        CLASS.VANGUARD,     6, {"Oriron": 7, "Polyester": 4},        {"Crystalline Electronic Unit": 4, "Refined Solvent": 6}),
	new Operator("Saria",           CLASS.DEFENDER,     6, {"Sugar": 8, "Polyketon": 5},        {"Bipolar Nanoflake": 4, "Manganese Trihydrate": 5}),
	new Operator("Schwarz",         CLASS.SNIPER,       6, {"Polyester": 8, "Sugar": 6},        {"D32 Steel": 4, "Oriron Block": 5}),
	new Operator("Shining",         CLASS.MEDIC,        6, {"Polyketon": 6, "Polyester": 5},    {"Bipolar Nanoflake": 4, "Oriron Block": 5}),
	new Operator("Siege",           CLASS.VANGUARD,     6, {"Sugar": 9, "Device": 3},           {"Bipolar Nanoflake": 4, "Orirock Concentration": 6}),
	new Operator("SilverAsh",       CLASS.GUARD,        6, {"Polyester": 8, "Device": 3},       {"D32 Steel": 4, "White Horse Kohl": 6}),
	new Operator("Skadi",           CLASS.GUARD,        6, {"Device": 5, "Polyester": 5},       {"D32 Steel": 4, "Orirock Concentration": 9}),
	new Operator("Skadi the Corrupting Heart", CLASS.SUPPORTER,   6, {"Polyester": 8, "Device": 3}, {"Polymerization Preparation": 4, "Grindstone Pentahydrate": 5}),
	new Operator("Surtr",           CLASS.GUARD,        6, {"Orirock Cube": 12, "Polyketon": 4}, {"Polymerization Preparation": 4, "Keton Colloid": 5}),
	new Operator("Suzuran",         CLASS.MEDIC,        6, {"Polyester": 8, "Oriron": 4},        {"D32 Steel": 4, "Grindstone Pentahydrate": 8}),
	new Operator("Thorns",          CLASS.GUARD,        6, {"Oriron": 8, "Polyketon": 3},        {"Polymerization Preparation": 4, "Oriron Block": 6}),
	new Operator("W",               CLASS.SNIPER,       6, {"Orirock Cube": 12, "Polyester": 5}, {"Bipolar Nanoflake": 4, "Keton Colloid": 7}),
	new Operator("Weedy",           CLASS.SPECIALIST,   6, {"Device": 6, "Sugar": 3},           {"D32 Steel": 4, "Manganese Trihydrate": 6}),
];

class SkillRecipe {
	constructor(recipes) {
		this.recipes = recipes;
	}

	getSummaries(rarity, level) {
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
};


const skillUpgradeDb = {
	"Andachiel": new SkillRecipe({"3": { "Orirock": 2 }, "4": { "Sugar": 1 }, "5": { "Polyester": 2 }, "6": { "RMA70-12": 1 }, "7": { "Orirock Cluster": 2 }}),
	"Ansel":    new SkillRecipe({ "3": { "Oriron Shard": 1 }, "4": { "Polyketon": 1 }, "5": { "Device": 1 }, "6": { "Polyester Pack": 2 }, "7": { "Oriron Cluster": 3 }}),
	"Beagle":   new SkillRecipe({ "3": { "Diketon": 1 }, "4": { "Device": 1 }, "5": { "Orirock Cube": 3 }, "6": { "Manganese Ore": 1 }, "7": { "Grindstone": 1 }}),
	"Cardigan": new SkillRecipe({ "3": { "Oriron Shard":1} , "4": {"Polyketon":1}, "5": { "Device":1 },"6":{"Loxic Kohl":1},"7":{"Manganese Ore":2}}),
	"Catapult": new SkillRecipe({ "3": { "Ester": 1 }, "4": { "Oriron": 1 }, "5": { "Polyketon": 2 }, "6": { "Manganese Ore": 1 }, "7": { "Grindstone": 1 }}),
	"Fang":     new SkillRecipe({ "3": { "Orirock": 2 }, "4": { "Sugar": 1 }, "5": { "Polyester": 2 }, "6": { "Oriron Cluster": 1 }, "7": { "Aketon": 2 }}),
	"Hibiscus": new SkillRecipe({ "3": { "Ester": 1 }, "4": { "Oriron": 1 }, "5": { "Polyketon": 2 }, "6": { "Sugar Pack": 2 }, "7": { "Polyester Pack": 2 }}),
	"Kroos":    new SkillRecipe({ "3": { "Damaged Device": 1 }, "4": { "Orirock Cube": 2 }, "5": { "Sugar": 2 }, "6": { "Grindstone": 1 }, "7": { "RMA70-12": 1 }}),
	"Lava":     new SkillRecipe({ "3": { "Sugar Substitute": 1 }, "4": { "Polyester": 1 }, "5": { "Oriron": 2 }, "6": { "Orirock Cluster": 2 }, "7": { "Sugar Pack": 2 }}),
	"Melantha": new SkillRecipe({ "3": { "Ester": 1 }, "4": { "Oriron": 1 }, "5": { "Polyketon": 2 }, "6": { "Integrated Device": 1 }, "7": { "Loxic Kohl": 2 }}),
	"Midnight": new SkillRecipe({ "3": { "Oriron Shard": 1 }, "4": { "Polyketon": 1 }, "5": { "Device": 1 }, "6": { "Grindstone": 1 }, "7": { "RMA70-12": 1 }}),
	"Orchid":   new SkillRecipe({ "3": { "Orirock": 2 }, "4": { "Sugar": 1 }, "5": { "Polyester": 2 }, "6": { "Integrated Device": 1 }, "7": { "Loxic Kohl": 2 }}),
	"Plume":    new SkillRecipe({ "3": { "Damaged Device": 1 }, "4": { "Orirock Cube": 2 }, "5": { "Sugar": 2 }, "6": { "Aketon": 1 }, "7": { "Integrated Device": 1 }}),
	"Popukar":  new SkillRecipe({ "3": { "Sugar Substitute": 1 }, "4": { "Polyester": 1 }, "5": { "Oriron": 2 }, "6": { "Loxic Kohl": 2 }, "7": { "Manganese Ore": 2 }}),
	"Spot":     new SkillRecipe({ "3": { "Diketon": 1 }, "4": { "Device": 1 }, "5": { "Orirock Cube": 3 }, "6": { "RMA70-12": 1 }, "7": { "Orirock Cluster": 2 }}),
	"Steward":  new SkillRecipe({ "3": { "Diketon": 1 }, "4": { "Device": 1 }, "5": { "Orirock Cube": 3 }, "6": { "Oriron Cluster": 1 }, "7": { "Aketon": 2 }}),
	"Vanilla":  new SkillRecipe({ "3": { "Sugar Substitute": 1 }, "4": { "Polyester": 1 }, "5": { "Oriron": 2 }, "6": { "Aketon": 1 }, "7": { "Integrated Device": 1 }}),

    "Aciddrop":     new SkillRecipe({ "3": {  "Orirock": 5 }, "4": {  "Sugar": 2 }, "5": {  "Polyester": 3 }, "6": {  "Aketon": 2 }, "7": {  "Coagulating Gel": 2 }, 
        "11": {  "Grindstone Pentahydrate": 1,  "Loxic Kohl": 4 }, "12": {  "Keton Colloid": 2,  "Polymerized Gel": 2 }, "13": {  "Bipolar Nanoflake": 2,  "Polymerized Gel": 2 }, 
        "21": {  "White Horse Kohl": 1,  "Aketon": 4 }, "22": {  "Incandescent Alloy Block": 2,  "RMA70-24": 2 }, "23": {  "Bipolar Nanoflake": 2,  "Orirock Concentration": 2 }}),
    "Ambriel":      new SkillRecipe({ "3": {  "Oriron": 3 }, "4": {  "Polyketon": 2 }, "5": {  "Device": 2 }, "6": {  "Coagulating Gel": 2 }, "7": {  "Incandescent Alloy": 3 }, 
        "11": {  "Manganese Trihydrate": 1,  "Integrated Device": 3 }, "12": {  "Incandescent Alloy Block": 2,  "RMA70-24": 2 }, "13": {  "Polymerization Preparation": 2,  "White Horse Kohl": 2 }, 
        "21": {  "Grindstone Pentahydrate": 1,  "Loxic Kohl": 4 }, "22": {  "Polymerized Gel": 2,  "Orirock Concentration": 3 }, "23": {  "D32 Steel": 2,  "Oriron Block": 2 }}),
    "Arene":        new SkillRecipe({ "3": {  "Diketon": 3 }, "4": {  "Device": 1 }, "5": {  "Orirock Cube": 4 }, "6": {  "Incandescent Alloy": 2 }, "7": {  "RMA70-12": 2 }, 
        "11": {  "White Horse Kohl": 1,  "Aketon": 4 }, "12": {  "Incandescent Alloy Block": 2,  "RMA70-24": 2 }, "13": {  "D32 Steel": 2,  "Polymerized Gel": 2 }, "21": {  "Keton Colloid": 1,  "Coagulating Gel": 3 }, 
        "22": {  "Orirock Concentration": 2,  "Grindstone Pentahydrate": 3 }, "23": {  "Polymerization Preparation": 2,  "Polymerized Gel": 2 }}),
    "Beanstalk":    new SkillRecipe({ "3": {  "Ester": 4 }, "4": {  "Oriron": 2 }, "5": {  "Polyketon": 3 }, "6": {  "Integrated Device": 2 }, "7": {  "Loxic Kohl": 3 }, 
        "11": {  "Grindstone Pentahydrate": 1,  "Loxic Kohl": 4 }, "12": {  "Polymerized Gel": 2,  "Orirock Concentration": 3 }, "13": {  "D32 Steel": 2,  "Polymerized Gel": 2 }, 
        "21": {  "Orirock Concentration": 1,  "Grindstone": 4 }, "22": {  "Incandescent Alloy Block": 2,  "RMA70-24": 2 }, "23": {  "Crystalline Electronic Unit": 2,  "Orirock Concentration": 2 }}),
    "Beehunter":    new SkillRecipe({ "3": {  "Damaged Device": 2 }, "4": {  "Orirock Cube": 2 }, "5": {  "Sugar": 3 }, "6": {  "Aketon": 2 }, "7": {  "Integrated Device": 2 }, 
        "11": {  "White Horse Kohl": 1,  "Aketon": 4 }, "12": {  "Grindstone Pentahydrate": 2,  "White Horse Kohl": 3 }, "13": {  "D32 Steel": 2,  "Orirock Concentration": 2 }, "21": {  "Manganese Trihydrate": 1,  "Integrated Device": 3 }, 
        "22": {  "RMA70-24": 2,  "Manganese Trihydrate": 2 }, "23": {  "Polymerization Preparation": 2,  "White Horse Kohl": 2 }}),
    "Bubble":       new SkillRecipe(),
    "Click":        new SkillRecipe(),
    "Conviction":   new SkillRecipe(),
    "Courier":      new SkillRecipe(),
    "Cuora":        new SkillRecipe(),
    "Cutter":       new SkillRecipe(),
    "Deepcolor":    new SkillRecipe(),
    "Dobermann":    new SkillRecipe(),
    "Dur-nar":      new SkillRecipe(),
    "Earthspirit":  new SkillRecipe(),
    "Estelle":      new SkillRecipe(),
    "Ethan":        new SkillRecipe(),
    "Frostleaf":    new SkillRecipe(),
    "Gavial":       new SkillRecipe(),
    "Gitano":       new SkillRecipe(),
    "Gravel":       new SkillRecipe(),
    "Greyy":        new SkillRecipe(),
    "Gummy":        new SkillRecipe(),
    "Haze":         new SkillRecipe(),
    "Indigo":       new SkillRecipe(),
    "Jackie":       new SkillRecipe(),
    "Jaye":         new SkillRecipe(),
    "Jessica":      new SkillRecipe(),
    "Matoimaru":    new SkillRecipe(),
    "Matterhorn":   new SkillRecipe(),
    "May":          new SkillRecipe(),
    "Meteor":       new SkillRecipe(),
    "Mousse":       new SkillRecipe(),
    "Myrrh":        new SkillRecipe(),
    "Myrtle":       new SkillRecipe(),
    "Perfumer":     new SkillRecipe(),
    "Pinecone":     new SkillRecipe(),
    "Podenco":      new SkillRecipe(),
    "Pudding":      new SkillRecipe(),
    "Purestream":   new SkillRecipe(),
    "Roberta":      new SkillRecipe(),
    "Rope":         new SkillRecipe(),
    "Scavenger":    new SkillRecipe(),
    "Shaw":         new SkillRecipe(),
    "ShiraYuki":    new SkillRecipe(),
    "Sussurro":     new SkillRecipe(),
    "Utage":        new SkillRecipe(),
    "Vermeil":      new SkillRecipe(),
    "Vigna":        new SkillRecipe(),
}