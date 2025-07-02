import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
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
            //label: node.translate('Test'),
            click: (e) => node.showReport(e),
            img: Images.images.test,
            /*padding: '1px 0',*/
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showReport() {
        alert('PMGridClass TEST!');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}