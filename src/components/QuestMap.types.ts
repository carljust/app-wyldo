import type { MapModel } from "../domain/maps";
export type QuestMapProps = {
  model: MapModel;
  onSelect?: (id: string) => void;
  global?: boolean;
};
