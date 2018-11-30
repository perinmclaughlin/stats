import { EventMatchSlots, EventMatchEntity } from "../persistence";

export function validateEventTeamMatches(json: any, teamMatches: any[], msgTitle: string) {
    let eventTeams = new Map<string, Map<string, number>>();
    json.eventMatches.forEach(eventMatch => {
      let map = new Map<string, number>();
      for(var slot of EventMatchSlots) {
        map.set(eventMatch[slot.prop], 1);
      }
      eventTeams.set(eventMatch.matchNumber, map);
    });

    let errors = [];
    teamMatches.forEach(teamMatch => {
      if(!eventTeams.has(teamMatch.matchNumber)) {
        errors.push(`${msgTitle}: Invalid team-match, match #${teamMatch.matchNumber} not found`)
      }else{
        let map = eventTeams.get(teamMatch.matchNumber);
        if(!map.has(teamMatch.teamNumber)) {
          errors.push(`${msgTitle}: Invalid team-match, team ${teamMatch.teamNumber} not in match #${teamMatch.matchNumber}`)
        }
      }
    });
    return errors;
  }


export function getTeamNumbers(match: EventMatchEntity): Map<string, number> {
    let teamNumbers = new Map<string, number>();
    for(var slot of EventMatchSlots) {
      teamNumbers.set(match[slot.prop], 1);
    }
    return teamNumbers;
  }
