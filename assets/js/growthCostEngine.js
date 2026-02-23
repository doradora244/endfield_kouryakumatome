export function calculateGrowthCost({ characterId, fromLevel, toLevel, costs, ownedByMaterial }) {
  const targetCosts = costs.filter(
    (cost) => cost.character_id === characterId && cost.from_level >= fromLevel && cost.to_level <= toLevel
  );

  const requiredByMaterial = new Map();
  let creditTotal = 0;

  targetCosts.forEach((cost) => {
    requiredByMaterial.set(cost.material_id, (requiredByMaterial.get(cost.material_id) ?? 0) + cost.amount);
    creditTotal += cost.credit_cost;
  });

  const breakdown = [...requiredByMaterial.entries()].map(([materialId, required]) => {
    const owned = Number(ownedByMaterial[materialId] ?? 0);
    return {
      material_id: materialId,
      required,
      owned,
      shortage: Math.max(required - owned, 0)
    };
  });

  return {
    found: targetCosts.length > 0,
    creditTotal,
    breakdown
  };
}
