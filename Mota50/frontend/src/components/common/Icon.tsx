import React from 'react';
import { MaterialIcons, FontAwesome, Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { iconSizes, iconColors, IconSize, IconColor } from '@/theme/icons';
import { colors } from '@/theme/colors';

export type IconSet = 'MaterialIcons' | 'FontAwesome' | 'Ionicons' | 'MaterialCommunityIcons' | 'Feather';

export interface IconProps {
  name: string;
  size?: IconSize | number;
  color?: IconColor | string;
  iconSet?: IconSet;
  style?: any;
}

const IconComponent: React.FC<IconProps> = ({
  name,
  size = 'medium',
  color = 'text',
  iconSet = 'MaterialIcons',
  style,
}) => {
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  const iconColor = typeof color === 'string' && color in iconColors 
    ? iconColors[color as IconColor] 
    : color;

  const iconProps = {
    name: name as any,
    size: iconSize,
    color: iconColor,
    style,
  };

  switch (iconSet) {
    case 'FontAwesome':
      return <FontAwesome {...iconProps} />;
    case 'Ionicons':
      return <Ionicons {...iconProps} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'Feather':
      return <Feather {...iconProps} />;
    case 'MaterialIcons':
    default:
      return <MaterialIcons {...iconProps} />;
  }
};

export default IconComponent;
