import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { IvyCard } from '@/components/ivy/ivy-card';
import { IvyText } from '@/components/ivy/ivy-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

const WEB_PRICING_URL =
  (process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost:3000') + '/pricing';

type PlanFeature = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type BillingPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  hasBaseFee: boolean;
  publiclyVisible: boolean;
  freeTrialDays: number | null;
  freeTrialEnabled: boolean;
  fee: {
    amount: number;
    amountFormatted: string;
    currency: string;
    currencySymbol: string;
  } | null;
  annualMonthlyFee: {
    amount: number;
    amountFormatted: string;
    currency: string;
    currencySymbol: string;
  } | null;
  features: PlanFeature[];
};

type PlanCardProps = {
  plan: BillingPlan;
  isActive: boolean;
  onPress: () => void;
};

function PlanCard({ plan, isActive, onPress }: PlanCardProps) {
  const isFree = !plan.hasBaseFee;
  const price = plan.fee
    ? `${plan.fee.currencySymbol}${plan.fee.amountFormatted}/mo`
    : 'Free';

  return (
    <Pressable
      onPress={!isActive ? onPress : undefined}
      className={`mb-3 overflow-hidden rounded-2xl border active:opacity-75 ${
        isActive
          ? 'border-ivy-accent bg-ivy-accent/10 dark:bg-ivy-accent/10'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <IvyText
              className={`text-base font-semibold ${
                isActive
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-800 dark:text-zinc-200'
              }`}
            >
              {plan.name}
            </IvyText>
            {isActive ? (
              <View className="rounded-full bg-ivy-accent px-2 py-0.5">
                <IvyText className="text-[10px] font-bold uppercase tracking-wide text-zinc-900">
                  Current
                </IvyText>
              </View>
            ) : plan.freeTrialEnabled && plan.freeTrialDays ? (
              <View className="rounded-full border border-ivy-accent/40 px-2 py-0.5">
                <IvyText className="text-[10px] font-medium text-ivy-accent">
                  {plan.freeTrialDays}d trial
                </IvyText>
              </View>
            ) : null}
          </View>

          {plan.description ? (
            <IvyText className="text-xs text-zinc-500 dark:text-zinc-400">
              {plan.description}
            </IvyText>
          ) : null}

          {plan.features.length > 0 && (
            <View className="mt-1 flex-row flex-wrap gap-x-3 gap-y-0.5">
              {plan.features.map((feature) => (
                <View key={feature.id} className="flex-row items-center gap-1">
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={11}
                    color={isActive ? IvyColors.accent : '#71717a'}
                  />
                  <IvyText className="text-xs text-zinc-500 dark:text-zinc-400">
                    {feature.name}
                  </IvyText>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="ml-3 items-end gap-1 flex-row items-center">
          <IvyText
            className={`text-base font-bold ${
              isActive ? 'text-ivy-accent' : 'text-zinc-900 dark:text-white'
            }`}
          >
            {isFree ? 'Free' : price}
          </IvyText>
          {!isActive && !isFree && (
            <IconSymbol name="chevron.right" size={14} color="#71717a" />
          )}
        </View>
      </View>
    </Pressable>
  );
}

export type MembershipSectionProps = {
  plans: BillingPlan[];
  activePlanSlugs: string[];
  isLoadingPlans: boolean;
  isLoadingSub: boolean;
  isErrorPlans: boolean;
  refetchPlans: () => void;
};

export function MembershipSection({
  plans,
  activePlanSlugs,
  isLoadingPlans,
  isLoadingSub,
  isErrorPlans,
  refetchPlans,
}: MembershipSectionProps) {
  const accent = IvyColors.accent;

  if (isLoadingPlans || isLoadingSub) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={accent} />
      </View>
    );
  }

  if (isErrorPlans) {
    return (
      <IvyCard className="px-4 py-4">
        <IvyText className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Could not load membership plans.
        </IvyText>
        <Pressable
          onPress={refetchPlans}
          className="mt-3 self-center rounded-xl bg-zinc-100 px-4 py-2 dark:bg-zinc-800"
        >
          <IvyText className="text-sm font-medium text-zinc-900 dark:text-white">
            Retry
          </IvyText>
        </Pressable>
      </IvyCard>
    );
  }

  const sortedPlans = [...plans].sort((a, b) => {
    const aPrice = a.fee?.amount ?? 0;
    const bPrice = b.fee?.amount ?? 0;
    return aPrice - bPrice;
  });

  const handlePress = () => {
    void WebBrowser.openAuthSessionAsync(WEB_PRICING_URL);
  };

  return (
    <View>
      {sortedPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isActive={activePlanSlugs.includes(plan.slug)}
          onPress={handlePress}
        />
      ))}
    </View>
  );
}
