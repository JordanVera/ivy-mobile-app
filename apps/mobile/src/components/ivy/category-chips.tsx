import { Pressable, ScrollView, View } from 'react-native';

import { IvyText } from './ivy-text';

type CategoryChipsProps = {
  categories: readonly string[];
  selected: string;
  onSelect: (c: string) => void;
};

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4 -mx-1"
    >
      <View className="flex-row gap-2 px-1 pb-1">
        {categories.map((c) => {
          const active = c === selected;
          return (
            <Pressable
              key={c}
              onPress={() => onSelect(c)}
              className={`rounded-full border px-4 py-2 ${
                active
                  ? 'border-amber-600 bg-amber-600 dark:border-amber-500 dark:bg-amber-600'
                  : 'border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800'
              }`}
            >
              <IvyText
                className={`text-sm font-medium ${
                  active ? 'text-white' : 'text-zinc-800 dark:text-zinc-200'
                }`}
              >
                {c}
              </IvyText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
