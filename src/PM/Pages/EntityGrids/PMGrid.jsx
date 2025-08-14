import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
import { RTreeView } from '../../../Grid/OuterComponents/TreeView'
import { FieldEdit } from '../../../Grid/FieldEdit';
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
    renderCell(grid, col, row) {
        if (col.name.toLowerCase() === 'isfavorite' && col.type !== 'lookup') {
            col.type = 'lookup';
            col.readonly = false;
            col.allowCombobox = true;
            col.required = true;
            col.keyField = col.name;
            col.comboboxValues = [{ value: 'Д', label: 'Д' }, { value: 'Н', label: 'Н' }];
        }
        return super.renderCell(grid, col, row);
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addToolbarButtons() {
        const grid = this;

        super.addToolbarButtons();

        let btn = {
            id: grid.buttons.length,
            name: 'tree',
            title: grid.translate('Tree'),
            click: (e) => grid.showTree(e),
            img: Images.images.folderTree,
        };

        grid.buttons.push(btn);
        grid._buttonsDict[btn.name] = btn;

        btn = {
            id: grid.buttons.length,
            name: 'link',
            title: 'Перейти по ссылке',
            click: (e) => grid.gotoLink(e),
            img: Images.images.link,
            getDisabled: () => {
                const row = grid.selectedRow();

                if (!row || !grid.colDict) return true;

                const col = grid.colDict['link_srrm'];

                return !col || !row[col.name];
            },
        };

        grid.buttons.push(btn);
        grid._buttonsDict[btn.name] = btn;

        btn = {
            id: grid.buttons.length,
            name: 'test',
            title: grid.translate('TEST'),
            click: (e) => grid.showTestResult(e),
            img: Images.images.test,
        };

        grid.buttons.push(btn);
        grid._buttonsDict[btn.name] = btn;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClosePopup() {
        const grid = this;
        super.onClosePopup();

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
                    grid.testPos = grid.testPos || { x: 100, y: 100, w: 200, h: 200 };
                    grid.popupPos = grid.testPos;
                    grid.popupTitle = 'TEST';

                    Images._outerImagesDict['test'] = result;

                    grid.refreshState();
                }
            }
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    gotoLink() {
        const grid = this;

        const col = grid.colDict['link_srrm'].name;
        let link = grid.selectedRow()[col];
        if (!link) return;


        const arr = link.split(':');
        if (arr.length > 1) {
            navigator.clipboard.writeText(link);
            alert('Ссылка скопирована в буфер.');
            if (arr[0] !== 'http' && arr[0] !== 'https') {
                link = 'file:///' + link.trim();
            }
        }
        else {
            link = 'http://' + link;
        }

        window.open(link, "_blank");

        //Object.assign(document.createElement('a'), {
        //    target: '_blank',
        //    rel: 'noopener noreferrer',
        //    href: link,
        //}).click();

        //window.open(link, "_blank");
        //window.open(link);
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
                    grid.treePos = grid.treePos || { x: 100, y: 100, w: 800, h: 600 };
                    grid.popupPos = grid.treePos;
                    grid.popupTitle = 'Дерево';

                    grid.refreshState();
                }
            }
        );

    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}