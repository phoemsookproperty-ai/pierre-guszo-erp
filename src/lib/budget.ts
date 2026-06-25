import { createClient } from '@/lib/supabase/server';

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  estimatedCost: number;
}

/**
 * Checks system budgets and individual Sales user limits before executing AI generation.
 */
export async function checkBudgetLimit(
  userId: string,
  customerId: string,
  requestedCount: number,
  costPerImage: number
): Promise<BudgetCheckResult> {
  const supabase = await createClient();
  const estimatedCost = requestedCount * costPerImage;
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch daily total cost spent by the system
  const { data: dailyLogs } = await supabase
    .from('ai_usage_logs')
    .select('cost')
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  const dailySpend = (dailyLogs || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);

  // 2. Fetch monthly total cost spent by the system
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { data: monthlyLogs } = await supabase
    .from('ai_usage_logs')
    .select('cost')
    .gte('created_at', startOfMonth);

  const monthlySpend = (monthlyLogs || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);

  // Load limits from env variables
  const maxDailyBudget = parseFloat(process.env.AI_TRYON_DAILY_BUDGET || '50.00');
  const maxMonthlyBudget = parseFloat(process.env.AI_TRYON_MONTHLY_BUDGET || '500.00');
  const userDailyLimit = parseInt(process.env.AI_TRYON_USER_DAILY_LIMIT || '20');

  // Check global budgets
  if (dailySpend + estimatedCost > maxDailyBudget) {
    return { allowed: false, reason: 'EXCEEDED_DAILY_GLOBAL_BUDGET', estimatedCost };
  }
  if (monthlySpend + estimatedCost > maxMonthlyBudget) {
    return { allowed: false, reason: 'EXCEEDED_MONTHLY_GLOBAL_BUDGET', estimatedCost };
  }

  // 3. Fetch individual staff daily generation count
  const { count: userDailyCount } = await supabase
    .from('ai_tryon_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('requested_by', userId)
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  if ((userDailyCount || 0) + requestedCount > userDailyLimit) {
    return { allowed: false, reason: 'EXCEEDED_USER_DAILY_LIMIT', estimatedCost };
  }

  // 4. Fetch per-customer daily limits
  const { count: customerDailyCount } = await supabase
    .from('ai_tryon_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`);

  const customerDailyLimit = parseInt(process.env.AI_TRYON_CUSTOMER_DAILY_LIMIT || '10');
  if ((customerDailyCount || 0) + requestedCount > customerDailyLimit) {
    return { allowed: false, reason: 'EXCEEDED_CUSTOMER_DAILY_LIMIT', estimatedCost };
  }

  return { allowed: true, estimatedCost };
}
