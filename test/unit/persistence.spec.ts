import { TeamMatch2019Entity, make2019match, QualitativeNumeric } from '../../src/persistence'
import { Container } from 'aurelia-framework';
import { MatchInputPage } from '../../src/games/deepspace/match-input';

describe('teamMatch2019Entity should exists', () => {
    /*it('validation should be true', () => {
        let container = new Container();
        let page: MatchInputPage = container.get(MatchInputPage);
        var data: TeamMatch2019Entity = make2019match('SOMETHING', '0000', '1')
        data.cargoPickup = 40;
        data.hatchPanelPickup = 40;
        console.info(data);

        page.validationController.validate({
            object: data,
            rules: page.rules
        }).then((validationResults) => {
            expect(validationResults.valid).toBe(true)
        })
    });
    it('validation should be false', () => {
        let container = new Container();
        let page: MatchInputPage = container.get(MatchInputPage);
        var data: TeamMatch2019Entity = make2019match('SOMETHING', '0000', '1')
        //data.cargoPickup = <QualitativeNumeric>-1;
        data.hatchPanelPickup = <QualitativeNumeric>-1;
        console.info(data);

        expect((<any>page.validationController).validator.validateObject).not.toBeNull();
        
        return page.validationController.validate({
            object: data,
            rules: page.rules
        }).then((validationResults) => {
            expect(validationResults.valid).toBe(false);
            //expect(validationResults.results[0].message).toBe("jnunuibcybcy");
            //expect(1).toBe(2);
        })
    });*/
})