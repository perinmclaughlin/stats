import { TeamRanking } from "./tba-api";


export function preDcmpSum(ranking: TeamRanking) {
    let result = 0;
    for (var event of ranking.event_points) {
        if (!event.district_cmp) {
            result += event.total || 0;
        }
    }
    result += ranking.rookie_bonus || 0;
    return result;
}

export function sortByPreDcmp(rankings: TeamRanking[]) {
    rankings.sort((a, b) => preDcmpSum(b) - preDcmpSum(a));
}

export function dcmpScore(ranking: TeamRanking) {
    for (var event of ranking.event_points) {
        if (event.district_cmp) {
            return event.total;
        }
    }
    return 0;
}

export function sortByDcmp(rankings: TeamRanking[]) {
    rankings.sort((a, b) => dcmpScore(b) - dcmpScore(a));
}

export function sortByTotal(rankings: TeamRanking[]) {
    rankings.sort((a, b) => b.point_total - a.point_total);
}

export interface Indexed<T> {
    index: number;
    a: T;
}