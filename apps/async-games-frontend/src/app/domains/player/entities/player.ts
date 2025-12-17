export interface PlayerSettings {
  isDealer?: boolean;
  isMuted?: boolean;
  showHints?: boolean;
}

export interface PlayerEntity {
  id: string;
  name: string;
  settings?: PlayerSettings;
}
