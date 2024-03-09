import type { Animated, ColorValue, GestureResponderEvent, StyleProp, TextStyle, ViewStyle } from "react-native";
import type { IconSource } from "react-native-paper/lib/typescript/components/Icon";

export type FABGroupActions = {
  icon: IconSource;
  label?: string;
  color?: string;
  labelTextColor?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  containerStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  labelStyle?: StyleProp<TextStyle>;
  labelMaxFontSizeMultiplier?: number;
  onPress: (e: GestureResponderEvent) => void;
  size?: "small" | "medium";
  testID?: string;
  rippleColor?: ColorValue;
}