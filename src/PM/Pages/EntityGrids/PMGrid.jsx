import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
import { RTreeView } from '../../../Grid/OuterComponents/TreeView'
export class PMGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return grid.showingTestResult ?
            <div dangerouslySetInnerHTML={{ __html: grid._testResult }}>
            </div>
            : grid.showingTree ?
                <RTreeView
                    data={grid._treeData}
                >
                </RTreeView>
                :
                super.renderPopupContent();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const node = this;

        super.addToolbarButtons();

        let btn = {
            id: node.buttons.length,
            name: 'tree',
            title: node.translate('Tree'),
            click: (e) => node.showTree(e),
            img: Images.images.folderTree,
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;

        btn = {
            id: node.buttons.length,
            name: 'test',
            title: node.translate('TEST'),
            click: (e) => node.showTestResult(e),
            img: Images.images.test,
        };

        node.buttons.push(btn);
        node._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClosePopup() {
        const grid = this;
        delete grid.showingTestResult;
        delete grid.showingTree;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showTestResult() {
        const grid = this;

        GLObject.dataGetter.get({ url: 'system/test', params: [], type: 'text', method: 'get' }).then(
            (result) => {
                if (result) {
                    grid._testResult = result;
                    grid.showingTestResult = true;
                    grid.popupIsShowing = true;
                    grid.popupPos = grid.popupPos || { x: 100, y: 100, w: 200, h: 200 };
                    grid.popupTitle = 'TEST';

                    Images._outerImagesDict['test'] = result;

                    grid.refreshState();
                }
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    showTree() {
        //alert('Showing tree!');

        const grid = this;
        const id = grid.selectedValue();
        if (!id || +id <= 0) return;

        GLObject.dataGetter.get({ url: 'SrRemarkEntity/getTree', params: [{ key: 'id', value: id }] }).then(
            (result) => {
                if (result) {
                    grid._treeData = result;

                    grid.popupIsShowing = true;
                    grid.showingTree = true;
                    grid.popupPos = grid.popupPos || { x: 100, y: 100, w: 800, h: 600 };
                    grid.popupTitle = 'Дерево';

                    grid.refreshState();
                }
            }
        );

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}