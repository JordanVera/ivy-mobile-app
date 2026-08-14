import { Image } from 'expo-image';
import { View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

export type HubMemberRowProps = {
  name: string;
  email: string | null;
  imageUrl: string | null;
  /** ISO 8601 string — when they created their SOAR account */
  joinedAppAt: string;
  /** ISO 8601 string — when they joined this hub */
  joinedHubAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function HubMemberRow({
  name,
  email,
  imageUrl,
  joinedAppAt,
  joinedHubAt,
}: HubMemberRowProps) {
  return (
    <View
      className="flex-row items-center gap-3 px-5 py-4"
      accessibilityLabel={`Member ${name}`}
    >
      {/* Avatar */}
      <View className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ivy-accent/15 dark:bg-ivy-accent/25">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            accessible={false}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <IconSymbol
              name="person.crop.circle.fill"
              size={32}
              color={IvyColors.accent}
            />
          </View>
        )}
      </View>

      {/* Info */}
      <View className="min-w-0 flex-1">
        <IvyText
          className="text-sm font-semibold text-zinc-900 dark:text-white"
          numberOfLines={1}
        >
          {name}
        </IvyText>
        {email ? (
          <IvyText
            className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400"
            numberOfLines={1}
          >
            {email}
          </IvyText>
        ) : null}
        <View className="mt-1.5 flex-row flex-wrap gap-x-3 gap-y-0.5">
          <IvyText className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Joined SOAR {formatDate(joinedAppAt)}
          </IvyText>
          <IvyText className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Hub since {formatDate(joinedHubAt)}
          </IvyText>
        </View>
      </View>
    </View>
  );
}
