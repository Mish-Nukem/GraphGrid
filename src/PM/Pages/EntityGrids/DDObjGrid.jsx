import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
export class DDObjGridClass extends GridINUClass {

    //constructor(props) {
    //    super(props);

    //    const grid = this;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecord() {
        const grid = this;

        if (!grid.tryGetNumClassAndId()) {
            alert('Не определены ID объекта и номер класса!');
        }

        grid.fileSelectPos = grid.fileSelectPos || { x: 110, y: 110, w: 500, h: 300 };
        grid.popupPos = grid.fileSelectPos;

        grid.popupIsShowing = true;
        grid.fileSelecting = true;
        grid.popupTitle = grid.title + ': выбор файла.';

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    tryGetNumClassAndId() {
        const grid = this;
        if (!grid.graph) return false;

        const classNode = grid.graph.nodesDict['10'];
        const remarksNode = grid.graph.nodesDict['05'];
        if (!classNode || !remarksNode || remarksNode.selectedValue() === undefined) return false;

        grid.numClass = classNode.value;
        grid.DDObjectId = remarksNode.selectedValue();

        return +grid.numClass > 0 && +grid.DDObjectId > 0;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderPopupContent() {
        const grid = this;
        return !grid.fileSelecting ? super.renderPopupContent()
            :
            <div>
                <input
                    className="form-control-file"
                    type="file"
                    style={{ width: "440px" }}
                    onChange={(e) => {
                        grid.fileName = e.target.value;

                        const DDFile = e.target.files[0];
                        grid.formData = new FormData();
                        grid.formData.append("DDFile", DDFile);

                        //super.addRecord(e);

                        grid.saveNewDDObject();

                        //grid.refreshState();

                    }}
                />
                <div id="progress0" className="upload-percent" style={{ marginTop: "5px" }}>
                    <span>{"Передача файла на сервер: "}</span><span className="percent">{grid.percent}</span>
                </div>
            </div>;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    //addToolbarButtons() {
    //    const node = this;

    //    super.addToolbarButtons();

    //    let btn = {
    //        id: node.buttons.length,
    //        name: 'test',
    //        title: node.translate('TEST'),
    //        //label: node.translate('Test'),
    //        click: (e) => node.showResult(e),
    //        img: Images.images.test,
    //        /*padding: '1px 0',*/
    //    };

    //    node.buttons.push(btn);
    //    node._buttonsDict[btn.name] = btn;
    //}
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClosePopup() {
        const grid = this;
        grid.popupIsShowing = false;
        grid.fileSelecting = false;

        delete grid.formData;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    saveNewDDObject() {
        const grid = this;

        // 1. Создаём новый XMLHttpRequest-объект
        let xhr = new XMLHttpRequest();

        // отслеживаем процесс отправки
        xhr.upload.onprogress = function (evt) {
            if (evt.lengthComputable) {
                let percentComplete = evt.loaded / evt.total;
                percentComplete = parseInt(percentComplete * 100);
                grid.percent = percentComplete + '%';
                grid.refreshState();
            }
        };

        // Ждём завершения: неважно, успешного или нет
        xhr.onloadend = function (data) {
            grid.popupIsShowing = false;
            grid.fileSelecting = false;

            if (xhr.status === 200) {
                if (data && +data.target.responseText > 0) {
                    grid.percent = 'Успешно.';
                    //grid.fileLoaded = data.target.responseText;

                    setTimeout(() => {
                        grid.refresh();
                        grid.refreshState();
                    }, 10);
                    //grid.refresh();
                }
            } else {
                console.log("Ошибка " + this.status);
                grid.refreshState();
            }
        };


        // 2. Настраиваем его: POST-запрос по URL
        xhr.open('POST', GLObject.dataGetter.APIurl + `DdObjectEntity/saveNewDDObject?numclass=${grid.numClass}&id=${grid.DDObjectId}&atoken=${GLObject.dataGetter.atoken}`);

        // 3. Отсылаем запрос
        xhr.send(grid.formData);

        xhr.onerror = function () {
            alert("Запрос не удался");
        };


        //const params = [];

        //GLObject.dataGetter.get({ url: 'DdObjectEntity/saveNewDDObject', params: params, type: 'text', method: 'get' }).then(
        //    (result) => {
        //        if (result) {
        //            grid._testResult = result;
        //            grid.popupIsShowing = true;
        //            grid.popupPos = grid.popupPos || { x: 100, y: 100, w: 200, h: 200 };
        //            grid.popupTitle = 'TEST';

        //            Images._outerImagesDict['test'] = result;

        //            grid.refreshState();
        //        }
        //    }
        //);

        //alert('PMGridClass TEST!');
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}