import * as S from "@effect/schema/Schema";

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
  cost: S.Number,
  coord: Coordinate
});
export type HexData = S.Schema.Type<typeof HexData>;

/**
 * GameStatus Schema (as a string-based enum replacement)
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
 * Supports both traditional number[][] and compressed string notation
 */
export const LevelData = S.Struct({
  id: S.Union(S.String, S.Number),
  description: S.optional(S.String),
  budget: S.Number,
  // We'll support both for transition, eventually migrating to just string
  grid: S.optional(S.Array(S.Array(S.Number))),
  gradient: S.optional(S.String), 
  start: S.optional(Coordinate),
  end: S.optional(Coordinate),
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