/**
 * Hand-drawn dark-fantasy silhouette icons, ported 1:1 from
 * Hoard/ember/icons.jsx to react-native-svg. 24x24 viewBox, 1.4 stroke.
 */

import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type EIconName =
  | 'skull'
  | 'eye'
  | 'rune-sigil'
  | 'tome'
  | 'plus'
  | 'search'
  | 'chevron-right'
  | 'chevron-left'
  | 'check'
  | 'x'
  | 'sort'
  | 'filter'
  | 'helm'
  | 'armor'
  | 'sword'
  | 'mace'
  | 'bow'
  | 'wand'
  | 'shield'
  | 'ring'
  | 'amulet'
  | 'belt'
  | 'boots'
  | 'gloves'
  | 'rune'
  | 'gem'
  | 'potion'
  | 'scroll'
  | 'charm'
  | 'chest'
  | 'flag'
  | 'trade'
  | 'fire'
  | 'candle'
  | 'cog'
  | 'download'
  | 'upload'
  | 'socket'
  | 'moon';

interface Props {
  name: EIconName;
  size?: number;
  color?: string;
  stroke?: number;
}

export function EIcon({
  name,
  size = 20,
  color = 'currentColor',
  stroke = 1.4,
}: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'skull':
      return (
        <Svg {...common}>
          <Path d="M12 3c-4.5 0-7 3-7 7v3l-1.5 2 1.5 1v2l2 1v2h3v-1l1 1h4l1-1v1h3v-2l2-1v-2l1.5-1-1.5-2V10c0-4-2.5-7-7-7z" />
          <Circle cx="9" cy="12" r="1.4" fill={color} stroke="none" />
          <Circle cx="15" cy="12" r="1.4" fill={color} stroke="none" />
          <Path d="M10 17l1-1h2l1 1" />
        </Svg>
      );
    case 'eye':
      return (
        <Svg {...common}>
          <Path d="M2 12c3-5 6-7 10-7s7 2 10 7c-3 5-6 7-10 7s-7-2-10-7z" />
          <Circle cx="12" cy="12" r="3.2" />
          <Circle cx="12" cy="12" r="0.9" fill={color} stroke="none" />
        </Svg>
      );
    case 'rune-sigil':
      return (
        <Svg {...common}>
          <Path d="M6 3l6 4 6-4v6l-6 4-6-4z" />
          <Path d="M12 13v8" />
          <Path d="M9 17l3 2 3-2" />
        </Svg>
      );
    case 'tome':
      return (
        <Svg {...common}>
          <Path d="M4 4h14a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          <Path d="M4 4v18" />
          <Path d="M8 8h8M8 12h8M8 16h5" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg {...common}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      );
    case 'search':
      return (
        <Svg {...common}>
          <Circle cx="10" cy="10" r="6" />
          <Path d="M15 15l5 5" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...common}>
          <Path d="M9 5l7 7-7 7" />
        </Svg>
      );
    case 'chevron-left':
      return (
        <Svg {...common}>
          <Path d="M15 5l-7 7 7 7" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M5 12l5 5L20 7" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...common}>
          <Path d="M6 6l12 12M6 18L18 6" />
        </Svg>
      );
    case 'sort':
      return (
        <Svg {...common}>
          <Path d="M6 9l3-3 3 3M9 6v12M15 15l3 3 3-3M18 18V6" />
        </Svg>
      );
    case 'filter':
      return (
        <Svg {...common}>
          <Path d="M3 5h18l-7 8v6l-4-2v-4z" />
        </Svg>
      );
    case 'helm':
      return (
        <Svg {...common}>
          <Path d="M6 14c0-5 3-9 6-9s6 4 6 9v3l-2 2H8l-2-2z" />
          <Path d="M9 14h6" />
          <Path d="M10 17v2M14 17v2" />
        </Svg>
      );
    case 'armor':
      return (
        <Svg {...common}>
          <Path d="M6 5l6-2 6 2v7c0 4-3 7-6 9-3-2-6-5-6-9z" />
          <Path d="M12 3v18M8 9h8" />
        </Svg>
      );
    case 'sword':
      return (
        <Svg {...common}>
          <Path d="M4 20l3-3 10-13 3 3L7 20z" />
          <Path d="M4 20l3-1 1-3" />
          <Path d="M13 8l3 3" />
        </Svg>
      );
    case 'mace':
      return (
        <Svg {...common}>
          <Circle cx="7" cy="17" r="3.5" />
          <Path d="M4 20l2-2M10 14l8-11" />
          <Path d="M16 3l5 5" />
        </Svg>
      );
    case 'bow':
      return (
        <Svg {...common}>
          <Path d="M5 3c8 0 14 6 14 14" />
          <Path d="M5 3v14l8-8z" />
          <Path d="M13 17l6 4" />
        </Svg>
      );
    case 'wand':
      return (
        <Svg {...common}>
          <Path d="M4 20l13-13" />
          <Path d="M17 4l3 3-3 3-3-3z" />
          <Path d="M6 18l-1 3 3-1" />
        </Svg>
      );
    case 'shield':
      return (
        <Svg {...common}>
          <Path d="M12 3l7 2v7c0 4-3 7-7 9-4-2-7-5-7-9V5z" />
          <Path d="M9 10l2 2 4-4" />
        </Svg>
      );
    case 'ring':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="14" r="6" />
          <Path d="M9 9l3-5 3 5" />
        </Svg>
      );
    case 'amulet':
      return (
        <Svg {...common}>
          <Path d="M6 3l3 4M18 3l-3 4" />
          <Path d="M12 21a6 6 0 00.001-12.001A6 6 0 0012 21z" />
          <Path d="M12 11l-2 4h4z" />
        </Svg>
      );
    case 'belt':
      return (
        <Svg {...common}>
          <Rect x="3" y="9" width="18" height="6" />
          <Circle cx="12" cy="12" r="1.5" />
          <Path d="M8 9v6M16 9v6" />
        </Svg>
      );
    case 'boots':
      return (
        <Svg {...common}>
          <Path d="M7 3h3v12l5 4v3H4v-3l3-2z" />
          <Path d="M7 15h3" />
        </Svg>
      );
    case 'gloves':
      return (
        <Svg {...common}>
          <Path d="M6 11V6a2 2 0 014 0v5M10 11V5a2 2 0 014 0v6M14 11V6a2 2 0 014 0v7c0 4-2 8-6 8s-6-3-6-7v-3z" />
        </Svg>
      );
    case 'rune':
      return (
        <Svg {...common}>
          <Path d="M4 4l8 16L20 4z" />
          <Path d="M4 4l16 0" />
          <Path d="M10 11h4" />
        </Svg>
      );
    case 'gem':
      return (
        <Svg {...common}>
          <Path d="M12 3l7 6-7 12L5 9z" />
          <Path d="M5 9h14M12 3v18M9 9l3 4 3-4" />
        </Svg>
      );
    case 'potion':
      return (
        <Svg {...common}>
          <Path d="M10 3h4v4l3 4v8a3 3 0 01-3 3H10a3 3 0 01-3-3v-8l3-4z" />
          <Path d="M7 13h10" />
          <Path d="M9 3h6" />
        </Svg>
      );
    case 'scroll':
      return (
        <Svg {...common}>
          <Path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
          <Path d="M5 7h14M5 19h14" />
          <Path d="M9 11h6M9 14h4" />
        </Svg>
      );
    case 'charm':
      return (
        <Svg {...common}>
          <Rect x="8" y="4" width="8" height="16" rx="1" />
          <Path d="M10 8h4M10 12h4M10 16h4" />
        </Svg>
      );
    case 'chest':
      return (
        <Svg {...common}>
          <Path d="M4 10a3 3 0 013-3h10a3 3 0 013 3v10H4z" />
          <Path d="M4 14h16" />
          <Rect x="11" y="12" width="2" height="4" />
        </Svg>
      );
    case 'flag':
      return (
        <Svg {...common}>
          <Path d="M5 3v18" />
          <Path d="M5 4h11l-2 4 2 4H5" />
        </Svg>
      );
    case 'trade':
      return (
        <Svg {...common}>
          <Path d="M3 8h14l-3-3M17 16H3l3 3" />
          <Path d="M17 8l4-3M17 16l4 3" />
        </Svg>
      );
    case 'fire':
      return (
        <Svg {...common}>
          <Path d="M12 3s4 4 4 8c0 1-1 2-2 2 0-2-1-3-2-4 0 3-3 5-3 8a5 5 0 0010 0c0-6-7-14-7-14z" />
        </Svg>
      );
    case 'candle':
      return (
        <Svg {...common}>
          <Rect x="9" y="9" width="6" height="12" />
          <Path d="M12 5c0 2 2 2 2 4s-1 2-2 2-2 0-2-2 2-2 2-4z" />
        </Svg>
      );
    case 'cog':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2v3M12 19v3M4.2 4.2l2 2M17.8 17.8l2 2M2 12h3M19 12h3M4.2 19.8l2-2M17.8 6.2l2-2" />
        </Svg>
      );
    case 'download':
      return (
        <Svg {...common}>
          <Path d="M12 3v13M7 11l5 5 5-5M4 20h16" />
        </Svg>
      );
    case 'upload':
      return (
        <Svg {...common}>
          <Path d="M12 16V3M7 8l5-5 5 5M4 20h16" />
        </Svg>
      );
    case 'socket':
      return (
        <Svg {...common}>
          <Rect x="3" y="3" width="6" height="6" />
          <Rect x="15" y="3" width="6" height="6" />
          <Rect x="3" y="15" width="6" height="6" />
          <Rect x="15" y="15" width="6" height="6" />
        </Svg>
      );
    case 'moon':
      return (
        <Svg {...common}>
          <Path d="M20 14A8 8 0 019 3a8 8 0 1011 11z" />
        </Svg>
      );
    default:
      return null;
  }
}
