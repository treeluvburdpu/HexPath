import * as S from "@effect/schema/Schema";

/**
 * Cost Schema: 0-15 (Hexadecimal range)
 */
export const Cost = S.Number.pipe(S.between(0, 15));
export type Cost = S.Schema.Type<typeof Cost>;

/**
 * Coordinate Schema
 */
export const Coordinate = S.Struct({
  row: S.Number,
  col: S.Number
});
export type Coordinate = S.Schema.Type<typeof Coordinate>;

/**
 * HexData Schema
 */
export const HexData = S.Struct({
  cost: Cost,
  coord: Coordinate
});
export type HexData = S.Schema.Type<typeof HexData>;

/**
 * GameStatus
 */
export const GameStatus = {
  PLAYING: 'PLAYING',
  WON: 'WON',
  LOST: 'LOST',
  LOADING: 'LOADING',
  HISTORY: 'HISTORY'
} as const;

export const GameStatusSchema = S.Literal(
  'PLAYING', 'WON', 'LOST', 'LOADING', 'HISTORY'
);
export type GameStatus = S.Schema.Type<typeof GameStatusSchema>;

/**
 * LevelData Schema
 * - gradient: The source of truth (required)
 * - grid: The parsed representation (populated at runtime)
 */
export const LevelData = S.Struct({
  id: S.Union(S.String, S.Number),
  description: S.optional(S.String),
  budget: S.Number,
  gradient: S.String, // Now required
  grid: S.optional(S.Array(S.Array(Cost))), 
  start: S.optional(Coordinate),
  end: S.optional(Coordinate),
  /**
   * Name of the tileset folder in /public/assets/tilesets/
   */
  tileset: S.optional(S.String),
  /**
   * Maps a character in the gradient (e.g. '4') to a visual template name (e.g. 'concentric')
   */
  templateMap: S.optional(S.Record({ key: S.String, value: S.String }))
});
export type LevelData = S.Schema.Type<typeof LevelData>;

/**
 * GameLogEntry Schema
 */
export const GameLogEntry = S.Struct({
  levelId: S.Union(S.String, S.Number),
  levelName: S.String,
  remainingBudget: S.Number,
  timestamp: S.Number,
  path: S.Array(Coordinate),
  levelData: LevelData
});
export type GameLogEntry = S.Schema.Type<typeof GameLogEntry>;

/**
 * Z-Index Layers for SVG Rendering
 */
export const Layer = {
  BACKGROUND: 0,
  HEATMAP: 1,
  TOPOGRAPHY: 2,
  SELECTION: 3,
  FOREGROUND: 4
} as const;
export type Layer = typeof Layer[keyof typeof Layer];
