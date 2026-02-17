interface Usage {
  tokens: number;
  cost: number;
}

const usageByUser = new Map<string, Usage>();

export function recordUsage(
  userId: string,
  tokens: number,
  cost: number
) {
  const current = usageByUser.get(userId) || {
    tokens: 0,
    cost: 0
  };

  current.tokens += tokens;
  current.cost += cost;

  usageByUser.set(userId, current);
}

export function getUsage(userId: string): Usage {
  return usageByUser.get(userId) || { tokens: 0, cost: 0 };
}
