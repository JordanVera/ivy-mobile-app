import { ReactNode } from 'react';
import { View } from 'react-native';

import { IvyText } from './ivy-text';

type ScreenHeaderProps = {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
};

export function ScreenHeader({
  title,
  left,
  right,
  className,
}: ScreenHeaderProps) {
  return (
    <View
      className={` flex-row items-center justify-between gap-2 px-1 ${className ?? ''} border-b border-zinc-200 dark:border-zinc-900`}
    >
      <View className="min-w-10 flex-1 flex-row justify-start">{left}</View>
      <IvyText
        className="flex-[2] text-center text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-white"
        numberOfLines={1}
      >
        {title}
      </IvyText>
      <View className="min-w-10 flex-1 flex-row justify-end">{right}</View>
    </View>
  );
}
