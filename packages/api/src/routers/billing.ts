import { createClerkClient } from '@clerk/backend';
import { TRPCError } from '@trpc/server';

import { protectedProcedure, publicProcedure, router } from '../trpc';

function requireClerkSecretKey(): string {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  if (!secret) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Missing CLERK_SECRET_KEY.',
    });
  }
  return secret;
}

function getClerk() {
  return createClerkClient({ secretKey: requireClerkSecretKey() });
}

export type BillingMoneyAmountData = {
  amount: number;
  amountFormatted: string;
  currency: string;
  currencySymbol: string;
};

export type BillingFeatureData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type BillingPlanData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  hasBaseFee: boolean;
  publiclyVisible: boolean;
  freeTrialDays: number | null;
  freeTrialEnabled: boolean;
  fee: BillingMoneyAmountData | null;
  annualFee: BillingMoneyAmountData | null;
  annualMonthlyFee: BillingMoneyAmountData | null;
  features: BillingFeatureData[];
};

export type BillingSubscriptionData = {
  id: string;
  status: string;
  activeAt: number | null;
  pastDueAt: number | null;
  nextPayment: {
    date: number;
    amount: BillingMoneyAmountData;
  } | null;
  activePlanIds: string[];
  activePlanSlugs: string[];
} | null;

const ACTIVE_ITEM_STATUSES = new Set(['active', 'past_due', 'incomplete']);

export const billingRouter = router({
  /**
   * Returns all publicly-visible user plans from Clerk.
   * Public procedure so unauthenticated users can view pricing.
   */
  plans: publicProcedure.query(async (): Promise<BillingPlanData[]> => {
    const clerk = getClerk();
    const result = await clerk.billing.getPlanList({ payerType: 'user' });

    return result.data.map(
      (plan): BillingPlanData => ({
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        isDefault: plan.isDefault,
        hasBaseFee: plan.hasBaseFee,
        publiclyVisible: plan.publiclyVisible,
        freeTrialDays: plan.freeTrialDays,
        freeTrialEnabled: plan.freeTrialEnabled,
        fee: plan.fee
          ? {
              amount: plan.fee.amount,
              amountFormatted: plan.fee.amountFormatted,
              currency: plan.fee.currency,
              currencySymbol: plan.fee.currencySymbol,
            }
          : null,
        annualFee: plan.annualFee
          ? {
              amount: plan.annualFee.amount,
              amountFormatted: plan.annualFee.amountFormatted,
              currency: plan.annualFee.currency,
              currencySymbol: plan.annualFee.currencySymbol,
            }
          : null,
        annualMonthlyFee: plan.annualMonthlyFee
          ? {
              amount: plan.annualMonthlyFee.amount,
              amountFormatted: plan.annualMonthlyFee.amountFormatted,
              currency: plan.annualMonthlyFee.currency,
              currencySymbol: plan.annualMonthlyFee.currencySymbol,
            }
          : null,
        features: plan.features.map((f) => ({
          id: f.id,
          name: f.name,
          slug: f.slug,
          description: f.description,
        })),
      }),
    );
  }),

  /**
   * Returns the current user's billing subscription from Clerk.
   * Returns null if the user has no subscription.
   */
  mySubscription: protectedProcedure.query(
    async ({ ctx }): Promise<BillingSubscriptionData> => {
      const clerk = getClerk();
      try {
        const sub = await clerk.billing.getUserBillingSubscription(
          ctx.clerkUserId,
        );

        const activePlanIds: string[] = [];
        const activePlanSlugs: string[] = [];
        for (const item of sub.subscriptionItems) {
          if (ACTIVE_ITEM_STATUSES.has(item.status)) {
            if (item.plan) {
              activePlanIds.push(item.plan.id);
              activePlanSlugs.push(item.plan.slug);
            } else if (item.planId) {
              activePlanIds.push(item.planId);
            }
          }
        }

        return {
          id: sub.id,
          status: sub.status,
          activeAt: sub.activeAt,
          pastDueAt: sub.pastDueAt,
          nextPayment: sub.nextPayment
            ? {
                date: sub.nextPayment.date,
                amount: {
                  amount: sub.nextPayment.amount.amount,
                  amountFormatted: sub.nextPayment.amount.amountFormatted,
                  currency: sub.nextPayment.amount.currency,
                  currencySymbol: sub.nextPayment.amount.currencySymbol,
                },
              }
            : null,
          activePlanIds,
          activePlanSlugs,
        };
      } catch {
        return null;
      }
    },
  ),
});
