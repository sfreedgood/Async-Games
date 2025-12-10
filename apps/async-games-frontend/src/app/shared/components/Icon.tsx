import React from 'react';

import * as Icons from '../../../assets/svgs';

export const iconNames = {
  spade: 'spade',
  heart: 'heart',
  diamond: 'diamond',
  club: 'club',
  joker: 'Joker',
} as const;

const iconSVG = {
  [iconNames.spade]: Icons.Spade,
  [iconNames.heart]: Icons.Heart,
  [iconNames.diamond]: Icons.Diamond,
  [iconNames.club]: Icons.Club,
  [iconNames.joker]: Icons.Joker,
} as const;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: keyof typeof iconSVG;
  height?: number;
  width?: number;
}

export const Icon: React.FC<IconProps> = ({
  icon,
  height,
  width,
}: IconProps) => {
  return <img height={height} width={width} src={iconSVG[icon]} alt={icon} />;
};
