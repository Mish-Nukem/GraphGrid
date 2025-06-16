import { GridINUClass } from '../../../Grid/GridINU';
export class PMGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const node = this;

        super.addToolbarButtons();

        let btn = {
            id: node.buttons.length,
            name: 'test',
            title: node.translate('TEST'),
            label: node.translate('Test'),
            click: (e) => node.test(e)
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    test() {
        alert('PMGridClass TEST!');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}