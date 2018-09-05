import { IEventJson } from "..";
import { TeamMatch2018V2Entity } from "../../persistence";

export interface PowerupV2EventJson extends IEventJson {
    matches2018: TeamMatch2018V2Entity[];
}