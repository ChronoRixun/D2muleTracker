import { SvgXml } from 'react-native-svg';

import { ITEM_TYPE_ICON_SVGS } from './itemTypeIconSvgs';

interface Props {
  itemType: string;
  size?: number;
  color?: string;
}

/**
 * Renders the SVG silhouette associated with a D2 item type, tinted to any
 * arbitrary colour. Falls back to the generic "other" icon for unknown types.
 */
export function ItemTypeIcon({ itemType, size = 20, color = '#8a8aa0' }: Props) {
  const svg = ITEM_TYPE_ICON_SVGS[itemType] ?? ITEM_TYPE_ICON_SVGS.other;
  if (!svg) return null;

  const coloredSvg = svg.replace(/fill="[^"]*"/g, `fill="${color}"`);

  return <SvgXml xml={coloredSvg} width={size} height={size} />;
}
