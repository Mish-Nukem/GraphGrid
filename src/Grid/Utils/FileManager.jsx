import { Translate } from '../Themes/Translate';
export class FileManager {
    constructor(settings) {
        const fm = this;

        fm.settings = settings;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // Сохранить данные в файл (папка Загрузки браузера).
    // content          - данные
    // filename         - имя файла, если надо с нужным расширением
    // fType            - тип данных. По умолчанию "application/octet-stream"
    // noConvertTob64   - не конвертировать бинарные типы данных
    SaveToFile = function (content, filename, fType, noConvertTob64) {
        if (content) {
            if (!filename)
                filename = "noNameData";
            var contentType = fType ? 'application/' + fType : 'application/octet-stream';
            if ((fType === 'pdf' || fType === 'excel' || fType === 'zip') && !noConvertTob64) {
                content = b64toBlob(content);
            }

            var blob1 = new Blob([content], { type: contentType }); //text/plain
            var a = document.createElement("a");
            var url = URL.createObjectURL(blob1);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function () {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
            return "Ок";

            function b64toBlob(b64Data, contentType) { //??? какая-то хитрая магия, без нее неправильно воспринимаются бинарный контент выгруженный с сервера, выяснить подробности
                contentType = contentType || '';
                var sliceSize = 512;
                b64Data = b64Data.replace(/^[^,]+,/, '');
                b64Data = b64Data.replace(/\s/g, '');
                var byteCharacters = window.atob(b64Data);
                var byteArrays = [];

                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    var slice = byteCharacters.slice(offset, offset + sliceSize);

                    var byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    var byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                var blob0 = new Blob(byteArrays, { type: contentType });
                return blob0;
            }
        }
        else
            return Translate.translate("No data defined to save.")
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}