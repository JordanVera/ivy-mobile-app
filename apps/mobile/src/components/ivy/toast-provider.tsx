import * as Haptics from 'expo-haptics';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { IvyColors } from '@/constants/ivy-colors';

import { IvyText } from './ivy-text';

type ToastType = 'success' | 'error' | 'info';

type ToastPayload = {
  message: string;
  type?: ToastType;
  duration?: number;
};

type ToastContextValue = {
  show: (payload: ToastPayload) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

type ActiveToast = {
  id: string;
  message: string;
  type: ToastType;
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<ActiveToast | null>(null);
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [active, opacity, translateY]);

  const show = useCallback(
    ({ message, type = 'success', duration = 3000 }: ToastPayload) => {
      if (type === 'success') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const id = `${Date.now()}`;
      setActive({ id, message, type });

      setTimeout(() => {
        setActive((curr) => (curr?.id === id ? null : curr));
      }, duration);
    },
    [],
  );

  const showSuccess = useCallback(
    (message: string) => show({ message, type: 'success' }),
    [show],
  );

  const showError = useCallback(
    (message: string) => show({ message, type: 'error' }),
    [show],
  );

  const dismiss = useCallback(() => {
    setActive(null);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const typeConfig: Record<
    ToastType,
    { icon: IconSymbolName; bg: string; text: string; iconColor: string }
  > = {
    success: {
      icon: 'checkmark.circle.fill',
      bg: 'bg-emerald-500',
      text: 'text-white',
      iconColor: '#ffffff',
    },
    error: {
      icon: 'xmark',
      bg: 'bg-red-500',
      text: 'text-white',
      iconColor: '#ffffff',
    },
    info: {
      icon: 'checkmark.circle.fill',
      bg: 'bg-ivy-accent',
      text: 'text-zinc-900',
      iconColor: IvyColors.onAccent,
    },
  };

  const config = active ? typeConfig[active.type] : typeConfig.success;

  return (
    <ToastContext.Provider value={{ show, showSuccess, showError }}>
      {children}
      {active ? (
        <View
          className="absolute left-0 right-0 z-50 px-4"
          style={{ top: insets.top + 8 }}
          pointerEvents="box-none"
        >
          <Animated.View style={[animatedStyle]} pointerEvents="auto">
            <Pressable
              onPress={dismiss}
              className={`flex-row items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${config.bg}`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <IconSymbol
                name={config.icon}
                size={24}
                color={config.iconColor}
              />
              <IvyText
                className={`flex-1 text-[15px] font-medium leading-5 ${config.text}`}
                numberOfLines={3}
              >
                {active.message}
              </IvyText>
            </Pressable>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}
