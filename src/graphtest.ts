import { autoinject } from "aurelia-framework";
import * as d3 from "d3v4";
import { TbaApi, TeamRanking } from "./tba-api";
import { sortByPreDcmp, preDcmpSum, Indexed } from "./district-ranking-utils";
import { makeGraphTestItems } from "./graphtest-utils";


@autoinject
export class GraphTest {

    public loading: boolean;
    public margin: object;
    public width: number;
    public height: number;
    public data1: any[];
    public data2: any[];
    public districtKeys = makeGraphTestItems([
        {
            key: "2014pnw",
            clazz: "line1",
        },
        {
            key: "2015pnw",
            clazz: "line2",
        },
        {
            key: "2016pnw",
            clazz: "line3",
        },
        {
            key: "2017pnw",
            clazz: "line4",
        },
        {
            key: "2018pnw",
            clazz: "line5",
        },
        {
            key: "2019pnw",
            clazz: "line6",
        }
    ]);
    public datas: Map<string, Indexed<TeamRanking>[]>;

    constructor(private api: TbaApi) {
        this.datas = new Map();
    }

    activate() {
        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        this.margin = margin;
        this.width = width;
        this.height = height;

        let promises = this.districtKeys.map(item => {
            return this.api.getDistrictRankings(item.key).then(rankings => {
                sortByPreDcmp(rankings);
                rankings.forEach((ranking, index) => {
                    (<any>ranking).index = index;
                });
                this.datas.set(item.key, rankings.map((ranking, index) => ({ index: index, a: ranking })));
            });
        });

        this.loading = true;
        Promise.all(promises).then(() => {
            this.loading = false;
            this.attachedNotReally();
        });
    }

    private makeLine(x, y) {
        return d3.line()
            .x((r: Indexed<TeamRanking>) => x(r.index))
            .y((r: Indexed<TeamRanking>) => y(preDcmpSum(r.a)));
    }

    attachedNotReally() {

        let x = d3.scaleLinear().range([0, this.width]);
        let y = d3.scaleLinear().range([this.height, 0]);

        x.domain([0, d3.max(Array.from(this.datas.values()), rankings => rankings.length)]);
        y.domain([0, d3.max(Array.from(this.datas.values()),
            rankings => d3.max(rankings, (r: Indexed<TeamRanking>) => preDcmpSum(r.a)))]);

        for (var item of this.districtKeys) {
            let valueLine = this.makeLine(x, y);
            let data = this.datas.get(item.key);
            d3.select(item.gElt)
                .data([data])
                .attr("d", valueLine);
        }

        d3.select("#leftAxis")
            .call(d3.axisLeft(y));

    }

    translate(a, b) {
        return `translate(${a}, ${b})`;
    }

    olattached() {
        var margin = { top: 20, right: 20, bottom: 30, left: 50 },
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
        this.margin = margin;
        this.width = width;
        this.height = height;

        let x = d3.scaleLinear().range([0, width]);
        let y = d3.scaleLinear().range([height, 0]);

        var svg = d3.select("#putithere").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
            `translate(${margin.left}, ${margin.top})`);

        let valueLine = d3.line()
            .x(d => x(d.index))
            .y(d => y(d.value));

        let valueLine2 = d3.line()
            .x(d => x(d.index))
            .y(d => y(d.value));


        let data = [
            { index: 0, value: 150 },
            { index: 1, value: 100 },
            { index: 2, value: 50 },
            { index: 3, value: 49 },
            { index: 4, value: 44 },
            { index: 5, value: 41 },
        ];

        let data2 = [
            { index: 0, value: 120 },
            { index: 1, value: 119 },
            { index: 2, value: 109 },
            { index: 3, value: 20 },
            { index: 4, value: 15 },
            { index: 5, value: 4 },
        ];

        x.domain([0, Math.max(
            d3.max(data, d => d.index),
            d3.max(data2, d => d.index))]);
        y.domain([0, Math.max(
            d3.max(data, d => d.value),
            d3.max(data2, d => d.value))]);
        svg.append("path")
            .data([data])
            .attr("class", "line1")
            .attr("d", valueLine);

        svg.append("path")
            .data([data2])
            .attr("class", "line2")
            .attr("d", valueLine2);

        svg.append("g")
            .call(d3.axisLeft(y));

        //this.olattached();
    }
}
