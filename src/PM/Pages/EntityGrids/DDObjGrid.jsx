import { GridINUClass } from '../../../Grid/GridINU';
import { Images } from '../../../Grid/Themes/Images';
import { GLObject } from '../../../Grid/GLObject';
export class DDObjGridClass extends GridINUClass {

    constructor(props) {
        super(props);

        const grid = this;

        grid.popupDimensionsByContent = true;
        grid._buttonsDict['copy'].getVisible = () => { return false };
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    addRecord() {
        const grid = this;

        if (!grid.tryGetNumClassAndId()) {
            alert('Не определены ID объекта и номер класса!');
        }

        grid.fileSelectPos = grid.fileSelectPos || { x: 110, y: 110, w: 300, h: 200 };
        grid.popupPos = grid.fileSelectPos;

        grid.popupIsShowing = true;
        grid.fileSelecting = true;
        grid.popupTitle = grid.title + ': выбор файла.';

        grid.refreshState();
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    viewRecord() {
        const grid = this;

        if (!grid.tryGetNumClassAndId()) {
            alert('Не определены ID объекта и номер класса!');
        }

        delete grid.previewData;
        grid.previewLoaded = false;

        const params = [];
        params.push({ key: 'id', value: grid.selectedValue() });

        GLObject.dataGetter.get({ url: 'DdObjectEntity/getDData', params: params }).then(
            (data) => {
                if (!data) return;

                grid.previewData = data;

                grid.fileViewPos = grid.fileViewPos || { x: 110, y: 110, w: 300, h: 200 };
                grid.popupPos = grid.fileViewPos;

                grid.popupIsShowing = true;
                grid.fileViewing = true;
                grid.popupTitle = grid.title + ': просмотр файла.';

                grid.refreshState();
            });
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    async prepareColumns() {
        const grid = this;
        if (grid._waitingColumns) return;

        await super.prepareColumns().then(() => {
            const ddCol = grid.colDict['DOP_DATA_DDOB'] || grid.colDict['dop_data_ddob'];
            if (ddCol) {
                ddCol.visible = false;
            }
            const idddCol = grid.colDict['ID_OBJECT_DDOB'] || grid.colDict['id_object_ddob'];
            if (idddCol) {
                idddCol.visible = false;
            }
        });
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
        return grid.fileSelecting ? grid.renderSelectFile()
            : grid.fileViewing ? grid.renderViewFile()
                : super.renderPopupContent()
            ;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderViewFile() {
        const grid = this;
        const row = grid.selectedRow();
        if (!row || !grid.previewData) return;

        //const decodedBase64 = atob(grid.previewData);

        const extention = row['EXPAND_DDOB'] || row['expand_ddob'];

        let mimeType = 'image/jpeg';
        let isImage = true;
        let isText = false;
        switch (extention) {
            case '.jpg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
            case '.svg':
                mimeType = 'image/svg+xml';
                break;
            case '.js':
                mimeType = 'text/javascript';
                isText = true;
                isImage = false;
                break;
            case '.txt':
                mimeType = 'text/plain';
                isText = true;
                isImage = false;
                break;
            case '.xml':
                mimeType = 'application/xml';
                isImage = false;
                break;
            case '.pdf':
                mimeType = 'application/pdf';
                isImage = false;
                break;
            case '.doc':
                mimeType = 'application/msword';
                isImage = false;
                break;
            case '.docx':
                mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                isImage = false;
                break;
            case '.xls':
                mimeType = 'application/vnd.ms-excel';
                isImage = false;
                break;
            case '.xlsx':
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                isImage = false;
                break;


                
        }

        const dataUri = `data:${mimeType};base64,${grid.previewData}`;

        return (
            <div>
                <div style={{ marginTop: "5px" }}>
                    {
                        isImage ?
                            <img src={dataUri}
                                onLoad={() => {
                                    if (grid.previewLoaded) return;

                                    grid.previewLoaded = true;
                                    grid.refreshState();
                                }}
                            />
                            :
                            isText ?
                                //<div dangerouslySetInnerHTML={{ __html: atob(grid.previewData) }}>
                                //</div>
                                <textarea
                                    value={atob(grid.previewData)}
                                    style={{ height: '600px', width: '800px' }}
                                >
                                </textarea>
                                :
                                <iframe
                                    src={dataUri} width="100%" height="600px"
                                    onLoad={() => {
                                        if (grid.previewLoaded) return;

                                        grid.previewLoaded = true;
                                        grid.refreshState();
                                    }}
                                />
                    }
                </div>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    renderSelectFile() {
        const grid = this;
        return (
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

                        grid.saveNewDDObject();
                    }}
                />
                <div id="progress0" className="upload-percent" style={{ marginTop: "5px" }}>
                    <span>{"Передача файла на сервер: "}</span><span className="percent">{grid.percent}</span>
                </div>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    onClosePopup() {
        const grid = this;
        super.onClosePopup();

        grid.fileSelecting = false;
        grid.fileViewing = false;

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
                if (data) {
                    if (+data.target.responseText > 0) {
                        grid.percent = 'Успешно.';
                        setTimeout(() => {
                            grid.refresh();
                            grid.refreshState();
                        }, 10);
                    }
                    else {
                        alert('Не удалось сохранить файл.');
                        console.log("Ошибка " + this.status);
                        grid.refreshState();
                    }
                    //grid.fileLoaded = data.target.responseText;
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
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}