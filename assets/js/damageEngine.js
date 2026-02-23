export function calculateSimpleDamage(input) {
  const {
    atk = 0,
    skillMultiplier = 1,
    critRate = 0,
    critDamage = 0.5,
    elementModifier = 1,
    flatBuff = 0,
    percentBuff = 0,
    enemyDef = 0,
    enemyResist = 0,
    hitCount = 1
  } = input;

  const buffedAtk = (atk + flatBuff) * (1 + percentBuff);
  const defenseFactor = Math.max(1 - enemyDef / (enemyDef + 1000), 0.05);
  const resistFactor = Math.max(1 - enemyResist, 0);
  const nonCrit = buffedAtk * skillMultiplier * elementModifier * defenseFactor * resistFactor;
  const crit = nonCrit * (1 + critDamage);
  const expected = nonCrit * (1 - critRate) + crit * critRate;

  return {
    per_hit: nonCrit,
    total: nonCrit * hitCount,
    expected_crit_per_hit: expected,
    expected_crit_total: expected * hitCount
  };
}
