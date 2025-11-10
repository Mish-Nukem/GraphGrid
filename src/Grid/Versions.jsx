export default class Versions {

    getRows(e) {
        const v = this;

        return new Promise(function (resolve, reject) {

            const rows = v.getVersions(e);

            if (rows != null) {
                resolve(rows);
            } else {
                reject(Error("Error getting rows"));
            }
        });
    }

    versionRows = [
        {
            Id: 0, Version: '1.0.0', App: 'React Grid', Description: 'Начальная версия.', Date: '21/10/2025'
        },
        {
            Id: 1, Version: '1.0.1', App: 'React Grid',
            Description: ` 1. При расширении колонок теперь легче нащупать границы колонок.\n 2. Добавлена зависимость параметров отчетов друг от друга.\n 3. Появилась возможность рисовать ячейки с изменяемым по высоте размером.`,
            Date: '23/10/2025'
        },
        {
            Id: 2, Version: '1.0.2', App: 'React Grid',
            Description: `Добавлен режим "без CSS", в котором css на странице полностью отсутствует.`,
            Date: '24/10/2025'
        },
        {
            Id: 3, Version: '1.0.3', App: 'MR',
            Description: `В проект "Мирный" добавлены PNG-картинки на кнопки гридов и в главное меню.`,
            Date: '29/10/2025'
        },
        {
            Id: 4, Version: '1.0.4', App: 'React Grid',
            Description: `В главном меню исправлена ширина корневых пунктов.`,
            Date: '30/10/2025'
        },
        {
            Id: 5, Version: '1.0.5', App: 'MR',
            Description: `В проект "Мирный" добавлена возможность выбирать размеры картинок (16, 24 и 32).`,
            Date: '31/10/2025'
        },
        {
            Id: 6, Version: '1.0.6', App: 'React Grid',
            Description: `Изменения в стилях.`,
            Date: '05/11/2025'
        },
        {
            Id: 7, Version: '1.0.7', App: 'React Grid',
            Description: ` 1. Исправлены ошибки в главном меню (при возврате с дочернего списка на родительский пункт закрывалось все меню, исправлено "залипание" меню). \n 2. Исправлена ошибка в lookup-колонке (для readonly-колонок показывался id вместо значения)`,
            Date: '06/11/2025'
        },
        {
            Id: 8, Version: '1.0.8', App: 'React Grid',
            Description: `Изменения в стилях. Небольшой фикс главного меню (при переходе на пункт меню без выпадающего списка не закрывался ранее открытый)`,
            Date: '07/11/2025'
        },
        {
            Id: 9, Version: '1.0.9', App: 'MR',
            Description: `Из главного меню убраны нереализованные пункты`,
            Date: '10/11/2025'
        },
    ];

    // Не забываем менять LastVersion !!!
    static LastVersion = 'v1.0.9';

    getVersions(e) {

        if (e.autocompleteColumn) {
            e.grid._autocomplDict = {};
            e.grid._autocomplCount = 0;
        }

        let rows = [];

        for (let row of this.versionRows) {
            if (!this.passRow(e.grid, row, e.autocompleteColumn)) continue;

            if (e.autocompleteColumn) {
                e.grid._autocomplCount++;
                if (e.grid._autocomplCount > 10) break;

                let cellValue = row[e.autocompleteColumn.name];
                e.grid._autocomplDict[String(cellValue).toLowerCase()] = 1;

                rows.push(cellValue);
            }
            else {
                rows.push(row);
            }
        }

        if (!e.autocompleteColumn) {
            e.grid.totalRows = rows.length;

            if (e.grid.columns && e.grid.columns.length > 0) {
                let sortCol = null;
                for (let col of e.grid.columns) {
                    if (col.asc || col.desc) {
                        sortCol = col;
                        break;
                    }
                }

                if (sortCol != null) {
                    rows.sort(function (a, b) { return a[sortCol.name] > b[sortCol.name] ? (sortCol.asc ? 1 : -1) : (sortCol.asc ? -1 : 1); });
                }
            }
            else {
                rows.sort(function (a, b) { return a['Id'] > b['Id'] ? -1 : 1; });
            }
        }

        if (e.autocompleteColumn) {
            rows.sort(function (a, b) { return a > b ? 1 : -1; });
        }
        else {
            rows = e.grid.pageSize > 0 && e.grid.pageNumber > 0 ? rows.slice((e.grid.pageNumber - 1) * e.grid.pageSize, e.grid.pageNumber * e.grid.pageSize) : rows;

            e.grid.rows = rows;
        }

        return rows;
    }

    getColumns() {
        return [
            { name: 'Id', sortable: true, filtrable: true, w: 60, desc: 1 },
            { name: 'Version', title: '№ Версии', sortable: true, filtrable: true, w: 90 },
            { name: 'App', title: 'Приложение', sortable: true, filtrable: true, w: 140 },
            { name: 'Description', title: 'Описание', sortable: true, filtrable: true, w: 500, allowVerticalResize: true },
            { name: 'Date', title: 'Дата', sortable: true, filtrable: true, w: 90 }
        ]
    }

    passRow(grid, row, autocompleteColumn) {
        if (!grid.columns) return true;

        for (let col of grid.columns) {
            if (!col.filtrable || (col.filter == null || col.filter == '') && !autocompleteColumn) continue;

            const cellValue = String(row[col.name]).toLowerCase();
            if (cellValue == '') return false;

            const filter = col.filter == null || col.filter == '' ? '' : col.filter.toLowerCase();

            if (filter != '') {
                if (autocompleteColumn) {
                    if (autocompleteColumn == col && cellValue.indexOf(filter) != 0 || autocompleteColumn != col && cellValue != filter) return false;

                }
                else {
                    if (cellValue != filter) return false;
                }
            }

            if (autocompleteColumn && grid._autocomplDict[cellValue]) return false;
        }

        return true;
    }
}