import React from 'react';

import * as Icons from '../assets/svgs';

const icons = {
  spade: Icons.Spade,
  heart: Icons.Heart,
  diamond: Icons.Diamond,
  club: Icons.Club,
  joker: Icons.Joker,
} as const;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: keyof typeof icons;
  height?: number;
  width?: number;
}

const Icon: React.FC<IconProps> = ({ icon, height, width }: IconProps) => {
  return <img height={height} width={width} src={icons[icon]} />;
};

export default Icon;
