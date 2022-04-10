class Material {
	constructor(tier, recipe) {
		this.tier = tier;
		this.recipe = recipe;
	}
};

class MaterialEntry {
	constructor() {
		this.has = 0;
		this.needed = 0;
		this.recipeTotal = 0;
	}
}

const upgradeMaterials = {
	// Tier 1
	'Orirock': new Material(1, {}),
	'Oriron Shard': new Material(1, {}),
	'Diketon': new Material(1, {}),
	'Sugar Substitute': new Material(1, {}),
	'Ester': new Material(1, {}),
	'Damaged Device': new Material(1, {}),

	// Tier 2
	'Orirock Cube': new Material(2, {'Orirock': 3}),
	'Oriron': new Material(2, {'Oriron Shard': 3}),
	'Polyketon': new Material(2, {'Diketon': 3}),
	'Sugar': new Material(2, {'Sugar Substitute': 3}),
	'Polyester': new Material(2, {'Ester': 3}),
	'Device': new Material(2, {'Damaged Device': 3}),

	// Tier 3
	'Orirock Cluster': new Material(3, {'Orirock Cube': 5}),
	'Oriron Cluster': new Material(3, {'Oriron': 4}),
	'Aketon':new Material(3, {'Polyketon': 4}),
	'Sugar Pack': new Material(3, {'Sugar': 4}),
	'Polyester Pack': new Material( 3, {'Polyester': 4}),
	'Integrated Device': new Material(3, {'Device': 4}),
	'Grindstone': new Material(3, {}),
	'RMA70-12': new Material(3, {}),
	'Manganese Ore': new Material(3, {}),
	'Loxic Kohl': new Material(3, {}),
	'Incandescent Alloy': new Material(3, {}),
	'Crystalline Component': new Material(3, {}),
	'Coagulating Gel': new Material(3, {}),
	'Compound Lubricant': new Material(3, {}),
	'Semi-Organic Solvent': new Material(3, {}),

	// Tier 4
	'Orirock Concentration':    new Material(4, {'Orirock Cluster': 5}),
	'Oriron Block':             new Material(4, {'Oriron Cluster': 2, 'Integrated Device': 1, 'Polyester Pack': 1}),
	'Keton Colloid':            new Material(4, {'Aketon': 2, 'Sugar Pack': 1, 'Manganese Ore': 1}),
	'Sugar Lump':               new Material(4, {'Sugar Pack': 2, 'Oriron Cluster': 1, 'Manganese Ore': 1}),
	'Polyester Lump':           new Material(4, {'Polyester Pack': 2, 'Aketon': 1, 'Loxic Kohl': 1}),
	'Optimized Device':         new Material(4, {'Integrated Device': 1, 'Orirock Cluster': 2, 'Grindstone': 1}),
	'Grindstone Pentahydrate':  new Material(4, {'Grindstone': 1, 'Oriron Cluster': 1, 'Integrated Device': 1}),
	'RMA70-24':                 new Material(4, {'RMA70-12': 1, 'Orirock Cluster': 1, 'Aketon': 1}),
	'Manganese Trihydrate':     new Material(4, {'Manganese Ore': 2, 'Polyester Pack': 1, 'Loxic Kohl': 1}),
	'White Horse Kohl':         new Material(4, {'Loxic Kohl': 1, 'Sugar Pack': 1, 'RMA70-12': 1}),
	'Incandescent Alloy Block': new Material(4, {'Integrated Device': 1, 'Grindstone': 1, 'Incandescent Alloy': 1}),
	'Crystalline Circuit':      new Material(4, {'Crystalline Component': 1, 'Coagulating Gel': 1, 'Incandescent Alloy': 1}),
	'Polymerized Gel':          new Material(4, {'Oriron Cluster': 1, 'Coagulating Gel': 1, 'Incandescent Alloy': 1}),
	'Pure Lubricant':           new Material(4, {}),
	'Refined Solvent':          new Material(4, {}),

	// Tier 5
	'Bipolar Nanoflake':            new Material(5, {'Optimized Device': 1, 'White Horse Kohl': 2}),
	'Crystalline Electronic Unit':  new Material(5, {'Crystalline Circuit': 1, 'Polymerized Gel': 2, 'Incandescent Alloy Block': 1}),
	'D32 Steel':                    new Material(5, {'Manganese Trihydrate': 1, 'Grindstone Pentahydrate': 1, 'RMA70-24': 1}),
	'Polymerization Preparation':   new Material(5, {'Orirock Concentration': 1, 'Oriron Block': 1, 'Keton Colloid': 1}),

	// Chips
	'Caster Chip': new Material(103, {}),
	'Defender Chip': new Material(103, {}),
	'Guard Chip': new Material(103, {}),
	'Medic Chip': new Material(103, {}),
	'Sniper Chip': new Material(103, {}),
	'Specialist Chip': new Material(103, {}),
	'Supporter Chip': new Material(103, {}),
	'Vanguard Chip': new Material(103, {}),

	'Caster Chip Pack': new Material(104, {}),
	'Defender Chip Pack': new Material(104, {}),
	'Guard Chip Pack': new Material(104, {}),
	'Medic Chip Pack': new Material(104, {}),
	'Sniper Chip Pack': new Material(104, {}),
	'Specialist Chip Pack': new Material(104, {}),
	'Supporter Chip Pack': new Material(104, {}),
	'Vanguard Chip Pack': new Material(104, {}),
	
	'Caster Dualchip': new Material(105, {'Caster Chip Pack': 2}),
	'Defender Dualchip': new Material(105, {'Defender Chip Pack': 2}),
	'Guard Dualchip': new Material(105, {'Guard Chip Pack': 2}),
	'Medic Dualchip': new Material(105, {'Medic Chip Pack': 2}),
	'Sniper Dualchip': new Material(105, {'Sniper Chip Pack': 2}),
	'Specialist Dualchip': new Material(105, {'Specialist Chip Pack': 2}),
	'Supporter Dualchip': new Material(105, {'Supporter Chip Pack': 2}),
	'Vanguard Dualchip': new Material(105, {'Vanguard Chip Pack': 2}),

	// Skills
	'Skill Summary 1': new Material(202, {}),
	'Skill Summary 2': new Material(203, {}),
	'Skill Summary 3': new Material(204, {}),
};