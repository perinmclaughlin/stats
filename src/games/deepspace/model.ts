import { IEventJson } from "..";
import { TeamMatch2019Entity } from "../../persistence";

export interface DeepSpaceEventJson extends IEventJson {
    matches2019: TeamMatch2019Entity[];
  } 