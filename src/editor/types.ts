export type ToolType =
  | 'filter'
  | 'resize'
  | 'crop'
  | 'draw'
  | 'text'
  | 'shapes'
  | 'stickers'
  | 'frame'
  | 'corners'
  | 'merge'
  | 'ai';

export interface EditorConfig {
  src?: string;
  width?: number;
  height?: number;
  onSave?: (dataUrl: string) => void;
  onClose?: () => void;
}

export interface LayerInfo {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  index: number;
}

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface DrawOptions {
  color: string;
  width: number;
  mode: 'pencil' | 'spray' | 'eraser';
  opacity: number;
}

export interface TextOptions {
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  underline: boolean;
}

export interface ShapeOptions {
  type: 'rect' | 'circle' | 'triangle' | 'line' | 'polygon' | 'star';
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface FilterPreset {
  name: string;
  filters: Array<{ type: string; options?: Record<string, any> }>;
}

export interface FrameConfig {
  name: string;
  color: string;
  width: number;
  style: 'solid' | 'double' | 'shadow' | 'rounded';
  opacity: number;
}

export interface CornerConfig {
  radius: number;
}

export interface ResizeConfig {
  width: number;
  height: number;
  maintainAspect: boolean;
}
