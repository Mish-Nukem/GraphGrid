import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
export class PMGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return !grid._testResult ? super.renderPopupContent()
            :
            <div dangerouslySetInnerHTML={{ __html: grid._testResult }}>
            </div>;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const node = this;

        super.addToolbarButtons();

        let btn = {
            id: node.buttons.length,
            name: 'test',
            title: node.translate('TEST'),
            //label: node.translate('Test'),
            click: (e) => node.showResult(e),
            img: Images.images.test,
            /*padding: '1px 0',*/
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClosePopup() {
        const grid = this;
        delete grid._testResult;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showResult() {
        const grid = this;

        GLObject.dataGetter.get({ url: 'system/test', params: [], type: 'text', method: 'get' }).then(
            (result) => {
                if (result) {
                    grid._testResult = result;
                    grid.popupIsShowing = true;
                    grid.popupPos = grid.popupPos || { x: 100, y: 100, w: 200, h: 200 };
                    grid.popupTitle = 'TEST';

                    Images._outerImagesDict['test'] = result;

                    grid.refreshState();
                }
            }
        );

        //alert('PMGridClass TEST!');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}