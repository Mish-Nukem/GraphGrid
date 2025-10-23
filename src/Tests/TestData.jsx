import { GraphClass, WaveType } from '../Grid/Graph';
import { BaseComponent, NodeStatus, FilterType } from '../Grid/Base';
export default class TestData {

    //constructor() {
    //}

    getFamily(e) {
        const family = [
            { Id: 1, ParentId: [3, 4], Name: 'Mikle', SecondName: 'Razumtsev', Date: '26/01/1979', Comment: 'Good boy' },
            { Id: 2, ParentId: [0], Name: 'Nataly', SecondName: 'Sche..', Date: '15/01/1999', Comment: 'Good girl' },
            { Id: 3, ParentId: [11, 23], Name: 'Lyuda', SecondName: 'Razumtseva', Date: '03/07/1953', Comment: 'Mommy' },
            { Id: 4, ParentId: [5, 22], Name: 'Borya', SecondName: 'Razumtsev', Date: '14/06/1953', Comment: 'Papa' },
            { Id: 5, ParentId: [0], Name: 'Nina', SecondName: 'Razumtseva', Date: '17/06/1917', Comment: 'Babushka' },
            { Id: 6, ParentId: [3, 4], Name: 'Evgenia', SecondName: 'Batyreva', Date: '31/10/1974', Comment: 'Sister' },
            { Id: 7, ParentId: [9, 10], Name: 'Ilia', SecondName: 'Razumtsev', Date: '16/09/1980', Comment: 'Brother 1' },
            { Id: 8, ParentId: [9, 10], Name: 'Mitka', SecondName: 'Razumtsev', Date: '04/07/1989', Comment: 'Brother 2' },
            { Id: 9, ParentId: [5, 22], Name: 'Kolya', SecondName: 'Razumtsev', Date: '02/11/1954', Comment: 'Dadya' },
            { Id: 10, ParentId: [11, 23], Name: 'Lara', SecondName: 'Razumtseva', Date: '31/01/1961', Comment: 'Tetya' },
            { Id: 11, ParentId: [0], Name: 'Valya', SecondName: 'Dolginova', Date: '23/06/1933', Comment: 'Babushka' },
            { Id: 12, ParentId: [6, 32], Name: 'Dashka', SecondName: 'Markelova', Date: '08/06/2000', Comment: 'Plemyannica 1' },
            { Id: 13, ParentId: [6, 32], Name: 'Katka', SecondName: 'Markelova', Date: '27/05/2003', Comment: 'Plemyannica 2' },
            { Id: 14, ParentId: [6, 31], Name: 'Tuyanka', SecondName: 'Batyreva', Date: '15/11/2010', Comment: 'Plemyannica 3' },
            { Id: 15, ParentId: [0], Name: 'Shura', SecondName: 'Pelushskaya', Date: '22/04/1919', Comment: 'Dv. Babushka' },
            { Id: 16, ParentId: [15], Name: 'Ira', SecondName: 'Pelushskaya', Date: '11/06/1947', Comment: 'Dv. Tetya' },
            { Id: 17, ParentId: [11, 23], Name: 'Sveta', SecondName: 'Dolginova', Date: '10/11/195?', Comment: 'Tetya' },
            { Id: 18, ParentId: [11, 23], Name: 'Rita', SecondName: 'Dolginova', Date: '23/10/195?', Comment: 'Tetya' },
            { Id: 19, ParentId: [11, 23], Name: 'Nadya', SecondName: 'Shaula', Date: '11/11/196?', Comment: 'Tetya' },
            { Id: 20, ParentId: [11, 23], Name: 'Vitia', SecondName: 'Dolginov', Date: '11/11/196?', Comment: 'Dadya' },
            { Id: 21, ParentId: [11, 23], Name: 'Tanya', SecondName: 'Dolginova', Date: '07/01/1963', Comment: 'Tetya' },
            { Id: 22, ParentId: [0], Name: 'Misha', SecondName: 'Razumtsev', Date: '??/??/19??', Comment: 'Ded' },
            { Id: 23, ParentId: [0], Name: 'Zambo', SecondName: 'Dolginov', Date: '??/??/19??', Comment: 'Ded 2' },

            { Id: 24, ParentId: [18, 34], Name: 'Alina', SecondName: 'Ushakova', Date: '??/??/????', Comment: 'Dv. Sister' },
            { Id: 25, ParentId: [19, 33], Name: 'Igor', SecondName: 'Shaula', Date: '??/??/????', Comment: 'Dv. Brother' },
            { Id: 26, ParentId: [19, 33], Name: 'Dima', SecondName: 'Shaula', Date: '??/??/????', Comment: 'Dv. Brother' },
            { Id: 27, ParentId: [20, 35], Name: 'Olga', SecondName: 'Dolginova', Date: '??/??/????', Comment: 'Dv. Sister' },
            { Id: 28, ParentId: [20, 35], Name: 'Venia', SecondName: 'Dolginov', Date: '??/??/????', Comment: 'Dv. Brother' },
            { Id: 29, ParentId: [20, 36], Name: 'Oleg', SecondName: 'Dolginov', Date: '??/??/????', Comment: 'Dv. Brother' },

            { Id: 30, ParentId: [0], Name: 'Yura', SecondName: 'Pelushskiy', Date: '??/??/????', Comment: 'Dv. Ded' },
            { Id: 31, ParentId: [0], Name: 'Sanal', SecondName: 'Batyrev', Date: '11/06/????', Comment: 'Muzh Sestry 3' },
            { Id: 32, ParentId: [0], Name: 'Dima', SecondName: 'Markelov', Date: '??/??/????', Comment: 'Muzh Sestry 2' },
            { Id: 33, ParentId: [0], Name: 'Slava', SecondName: 'Shaula', Date: '??/??/????', Comment: 'Muzh Teti' },
            { Id: 34, ParentId: [0], Name: 'Sasha', SecondName: 'Ushakov', Date: '??/??/????', Comment: 'Muzh Teti' },
            { Id: 35, ParentId: [0], Name: 'Toma', SecondName: '???', Date: '??/??/????', Comment: 'Mat Olgi i Veni' },
            { Id: 36, ParentId: [0], Name: 'Ira', SecondName: '???', Date: '??/??/????', Comment: 'Mat Olega' },
        ];

        if (e.autocompleteColumn) {
            e.grid._autocomplDict = {};
            e.grid._autocomplCount = 0;
        }

        let rows = [];

        for (let row of family) {
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

            if (e.grid.columns) {
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

    GetFamilyColumns() {
        return [{ name: 'Id', sortable: true, filtrable: true }, { name: 'Name', sortable: true, filtrable: true }, { name: 'SecondName', sortable: true, filtrable: true }, { name: 'Date', sortable: true }, { name: 'Comment', sortable: true, filtrable: true }]
    }

    getCity(e) {
        const cities = [
            { Id: 1, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23], City: 'Voronezh' },
            { Id: 2, ParentId: [1, 3, 4, 5, 6, 7, 9, 10, 11, 15, 16, 17, 18, 19, 20, 21, 22, 23], City: 'Grafskaya' },
            { Id: 3, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 28, 29], City: 'Moskow' },
            { Id: 4, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16, 30], City: 'Pskov' },
            { Id: 5, ParentId: [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29], City: 'Elista' },
            { Id: 6, ParentId: [1, 3, 4, 6, 12, 13, 14], City: 'Pyatigorsk' },
            { Id: 7, ParentId: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16], City: 'Piter' },
            { Id: 8, ParentId: [1, 3, 4, 11, 14, 17, 18, 19, 20, 23], City: 'Novosibirsk' },
            { Id: 9, ParentId: [5, 15, 30], City: 'Ustyuzhna' },
            { Id: 10, ParentId: [1, 7, 8, 9, 20], City: 'Army' },
            { Id: 11, ParentId: [2], City: 'Bali' },
            { Id: 12, ParentId: [2], City: 'Hanty-Mansiysk' },
            { Id: 13, ParentId: [21], City: 'Paris' },
            { Id: 14, ParentId: [19, 25, 26], City: 'Energodar' },
        ];

        if (e.autocompleteColumn) {
            e.grid._autocomplDict = {};
            e.grid._autocomplCount = 0;
        }

        let rows = [];

        for (let row of cities) {
            if (!this.passRow(e.grid, row, e.autocompleteColumn)) continue;

            if (e.filters && e.filters.length) {
                let filter = e.filters[0];
                filter = filter.filter ? filter.filter : filter;
                if (!row['ParentId'] || row['ParentId'].indexOf(+filter) < 0) continue;
            }

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

            if (e.grid.columns) {
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

    GetCityColumns() {
        return [{ name: 'Id', sortable: true }, { name: 'City', sortable: true, filtrable: true }]
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

    getTestGraph() {
        const graph = new GraphClass();

        //graph.noCachWave = true;
        graph.uid = 'TestPMGraph';

        const projectNode = { id: 0, entity: 'SrRProjectEntity', title: 'Проект', status: NodeStatus.filter, keyField: 'ID_SR_R_PROJECT_SRPJ', nameField: 'NAME_PROJ_SRPJ' };
        const promptNode = { id: 1, entity: 'SrRPromptnessEntity', title: 'Срочность выполнения', status: NodeStatus.filter, keyField: 'ID_SR_R_PROMPTNESS_SRPR', nameField: 'NAME_SRPR' };
        const statusNode = { id: 2, entity: 'SrRStatusEntity', title: 'Статус задания', status: NodeStatus.filter, keyField: 'ID_SR_R_STATUS_SRST', nameField: 'NAME_STATUS_SRST' };
        const executorNode = { id: 3, entity: 'SrRExecutiveEntity', entityAdd: '2', title: 'Исполнитель', status: NodeStatus.filter, keyField: 'ID_SR_R_EXECUTIVE_SREX', nameField: 'FIO_SREX' };
        const authorNode = { id: 4, entity: 'SrRExecutiveEntity', title: 'Автор задания', status: NodeStatus.filter, keyField: 'ID_SR_R_EXECUTIVE_SREX', nameField: 'FIO_SREX' };
        const datefromNode = { id: 5, title: 'Дата создания От', status: NodeStatus.filter, filterType: FilterType.date };
        const datetoNode = { id: 6, title: 'Дата создания По', status: NodeStatus.filter, filterType: FilterType.date };
        const remarkNode = { id: 7, parentGrids: '0,1,2,3,4,5,6,11', entity: 'SrRemarkEntity', title: 'Задания', status: NodeStatus.grid, keyField: 'ID_SR_REMARK_SRRM' };
        //const favoriteNode = { id: '8', entity: 'SrRemarkEntity', title: 'Избранное', status: NodeStatus.grid, keyField: 'ID_SR_REMARK_SRRM' };
        const detailsNode = { id: 9, parentGrids: '7', entity: 'SrDetailRemarkEntity', title: 'Детализация задания', status: NodeStatus.grid, keyField: 'ID_SR_DETAIL_REMARK_SRDR', isBottom: true };
        const addNode = { id: 10, parentGrids: '7', entity: 'DdObjectEntity', title: 'Дополнительные данные', status: NodeStatus.grid, keyField: 'ID_DD_OBJECT_DDOB', isBottom: true };

        const parentRemarkNode = { id: 11, /*parentGrids: '0,1,2,3,4,5,6',*/ entity: 'SrRemarkEntity', title: 'Родительское задание', status: NodeStatus.filter, keyField: 'ID_SR_REMARK_SRRM', schemeName: 'Remarks_scheme', inSchemeUid: '05' };

        graph.nodesDict[projectNode.id] = projectNode;
        graph.nodesDict[promptNode.id] = promptNode;
        graph.nodesDict[statusNode.id] = statusNode;
        graph.nodesDict[executorNode.id] = executorNode;
        graph.nodesDict[authorNode.id] = authorNode;
        graph.nodesDict[datefromNode.id] = datefromNode;
        graph.nodesDict[datetoNode.id] = datetoNode;
        graph.nodesDict[remarkNode.id] = remarkNode;
        //graph.nodesDict[favoriteNode.id] = favoriteNode;
        graph.nodesDict[detailsNode.id] = detailsNode;
        graph.nodesDict[addNode.id] = addNode;
        graph.nodesDict[parentRemarkNode.id] = parentRemarkNode; 

        /*
        //graph.nodeCount = 10;
        remarkNode.getColumns = function () {
            return [
                {
                    name: 'ID_SR_REMARK_SRRM',
                    title: 'ID задания',
                    sortable: true,
                    filtrable: true,
                    readonly: true,
                },
                {
                    name: 'NUMBER_PP_SRRM',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true,
                    required: true,
                },
                {
                    name: 'DATE_CREATE_SRRM',
                    title: 'Дата создания',
                    sortable: true,
                    filtrable: true,
                    type: 'date',
                },
                {
                    name: 'REMARK_SRRM',
                    title: 'Текст задания',
                    sortable: true,
                    filtrable: true,
                    required: true,
                    maxW: 600,
                },
                {
                    name: 'FROM_WHOM_SRRM_NAME',
                    title: 'Автор задания',
                    sortable: true,
                    filtrable: true,
                    type: 'lookup',
                    entity: 'SrRExecutiveEntity',
                    keyField: 'ID_FROM_WHOM_SRRM',
                    refKeyField: 'ID_SR_R_EXECUTIVE_SREX',
                    refNameField: 'FIO_SREX',
                },
                {
                    name: 'WHOM_SRRM_NAME',
                    title: 'Исполнитель задания',
                    sortable: true,
                    filtrable: true,
                    required: true,
                    type: 'lookup',
                    entity: 'SrRExecutiveEntity',
                    keyField: 'ID_WHOM_SRRM',
                    refKeyField: 'ID_SR_R_EXECUTIVE_SREX',
                    refNameField: 'FIO_SREX',
                },
                {
                    name: 'SR_R_PROJECT_SRRM_NAME',
                    title: 'Проект',
                    sortable: true,
                    filtrable: true,
                    required: true,
                    type: 'lookup',
                    entity: 'SrRProjectEntity',
                    keyField: 'ID_SR_R_PROJECT_SRRM',
                    refKeyField: 'ID_SR_R_PROJECT_SRPJ',
                    refNameField: 'NAME_PROJ_SRPJ',
                },
                {
                    name: 'SR_R_PROMPTNESS_SRRM_NAME',
                    title: 'Срочность',
                    sortable: true,
                    filtrable: true,
                    required: true,
                    type: 'lookup',
                    entity: 'SrRPromptnessEntity',
                    keyField: 'ID_SR_R_PROMPTNESS_SRRM',
                    refKeyField: 'ID_SR_R_PROMPTNESS_SRPR',
                    refNameField: 'NAME_SRPR',
                },
                {
                    name: 'SR_R_STATUS_SRRM_NAME',
                    title: 'Статус',
                    sortable: true,
                    filtrable: true,
                    required: true,
                    type: 'lookup',
                    entity: 'SrRStatusEntity',
                    keyField: 'ID_SR_R_STATUS_SRRM',
                    refKeyField: 'ID_SR_R_STATUS_SRST',
                    refNameField: 'NAME_STATUS_SRST',
                },
                {
                    name: 'COMMENT_EXECUT_SRRM',
                    title: 'Комментарий исполнителя',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_COMPLETE_SRRM',
                    title: 'Плановый срок выполнения',
                    sortable: true,
                    filtrable: true,
                    type: 'date',
                },
                {
                    name: 'NAME_DB_SRRM',
                    title: 'База данных',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'PROGRAM_SRRM',
                    title: 'Программа',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'PLACE_ERROR_SRRM',
                    title: 'Место возникновения ошибки',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'LINK_SRRM',
                    title: 'Ссылка на документ или скриншот',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'PARENT_REMARK_SRRM_NAME',
                    title: 'Замечание-родитель',
                    sortable: true,
                    filtrable: true,
                    type: 'lookup',
                    entity: 'SrRemarkEntity',
                    keyField: 'PARENT_REMARK_SRRM',
                    refKeyField: 'ID_SR_REMARK_SRRM',
                    refNameField: 'REMARK_SRRM',
                },
                {
                    name: 'DATE_EXECUTE_SRRM',
                    title: 'Дата выполнения',
                    sortable: true,
                    filtrable: true,
                    type: 'date',
                },
                {
                    name: 'DATE_CHECKED_SRRM',
                    title: 'Дата приемки',
                    sortable: true,
                    filtrable: true,
                    type: 'date',
                },
                {
                    name: 'IsFavorite',
                    title: 'В избранном',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SRRM',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true,
                    readonly: true,
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SRRM',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true,
                    readonly: true,
                },
                {
                    name: 'DATE_INPUT_SRRM',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true,
                    readonly: true,
                    type: 'date',
                },
                {
                    name: 'DATE_CHANGE_SRRM',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true,
                    readonly: true,
                    type: 'date',
                },
            ];
        }

        detailsNode.getColumns = function () {
            return [
                {
                    name: 'ID_SR_DETAIL_REMARK_SRDR',
                    title: 'ID',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'NUMBER_PP_SRDR',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DESCRIPTION_ACTION_SRDR',
                    title: 'Описание последовательности действий',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'LINK_SRDR',
                    title: 'Ссылка на документ или скриншот',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SRDR',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SRDR',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_SRDR',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_SRDR',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }

        addNode.getColumns = function () {
            return [
                {
                    name: 'NUMBER_PP_DDOB',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'TYPE_DATA_DDOB',
                    title: 'Тип данных',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'COMMENT_DDOB',
                    title: 'Комментарий',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'NUM_CLASS_DDOB_NAME',
                    title: 'Имя класса',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_DDOB',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_DDOB',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_DDOB',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_DDOB',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }
        projectNode.getColumns = function () {
            return [
                {
                    name: 'NAME_PROJ_SRPJ',
                    title: 'Наименование проекта',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DESCRIPTION_SRPJ',
                    title: 'Описание проекта',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SRPJ',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SRPJ',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_SRPJ',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_SRPJ',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }

        promptNode.getColumns = function () {
            return [
                {
                    name: 'NUMBER_PP_SRPR',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'NAME_SRPR',
                    title: 'Наименование',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DESCRIPTION_SRPR',
                    title: 'Описание',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SRPR',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SRPR',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_SRPR',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_SRPR',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }
        statusNode.getColumns = function () {
            return [
                {
                    name: 'NUMBER_PP_SRST',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'NAME_STATUS_SRST',
                    title: 'Наименование статуса',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'COMMENT_SRST',
                    title: 'Примечание',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SRST',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SRST',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_SRST',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_SRST',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }
        executorNode.getColumns = function () {
            return [
                {
                    name: 'NUMBER_PP_SREX',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'FIO_SREX',
                    title: 'ФИО',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'LOGIN_SREX',
                    title: 'Логин',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'LOGIN_IN_CHAT_SREX',
                    title: 'Логин в рабочем чате',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SREX',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SREX',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_SREX',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_SREX',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }
        authorNode.getColumns = function () {
            return [
                {
                    name: 'NUMBER_PP_SREX',
                    title: '№ п/п',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'FIO_SREX',
                    title: 'ФИО',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'LOGIN_SREX',
                    title: 'Логин',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'LOGIN_IN_CHAT_SREX',
                    title: 'Логин в рабочем чате',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'VVOD_ID_CONTRACTOR_SREX',
                    title: 'Автор ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'CHANGE_ID_CONTRACTOR_SREX',
                    title: 'Автор изменения',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_INPUT_SREX',
                    title: 'Дата ввода',
                    sortable: true,
                    filtrable: true
                },
                {
                    name: 'DATE_CHANGE_SREX',
                    title: 'Дата изменения',
                    sortable: true,
                    filtrable: true
                },
            ];
        }
        */
        function connect(child, parent) {
            const link = { parent: parent, child: child };

            const lkey = child.id + '_' + parent.id;
            graph.linksDict[lkey] = link;

            child.parents = child.parents || [];
            child.parents.push(parent.uid);

            parent.children = parent.children || [];
            parent.children.push(child.uid);
        }

        for (let uid in graph.nodesDict) {
            let node = graph.nodesDict[uid];
            node.uid = uid;
            node.children = node.children || [];
            node.parents = node.parents || [];
        }

        for (let uid in graph.nodesDict) {
            let node = graph.nodesDict[uid];

            if (!node.parentGrids) continue;

            let parentUids = ',' + node.parentGrids + ',';

            for (let cid in graph.nodesDict) {
                if (cid === node.uid) continue;
                let pnode = graph.nodesDict[cid];

                if (parentUids.indexOf(pnode.id) <= 0) continue;

                connect(node, pnode);
            }
        }

        graph.linksDict['7_11'].condition = 'SR_REMARK_SRRM.PARENT_REMARK_SRRM in (:id)';

        graph.linksDict['7_0'].condition = 'SR_REMARK_SRRM.ID_SR_R_PROJECT_SRRM in (:id)';
        graph.linksDict['7_1'].condition = 'SR_REMARK_SRRM.ID_SR_R_PROMPTNESS_SRRM in (:id)';
        graph.linksDict['7_2'].condition = 'SR_REMARK_SRRM.ID_SR_R_STATUS_SRRM in (:id)';
        graph.linksDict['7_3'].condition = 'SR_REMARK_SRRM.ID_WHOM_SRRM in (:id)';
        graph.linksDict['7_4'].condition = 'SR_REMARK_SRRM.ID_FROM_WHOM_SRRM in (:id)';
        graph.linksDict['7_5'].condition = 'SR_REMARK_SRRM.DATE_CREATE_SRRM >= :id';
        graph.linksDict['7_6'].condition = 'SR_REMARK_SRRM.DATE_CREATE_SRRM <= :id';

        graph.linksDict['9_7'].condition = 'SR_DETAIL_REMARK_SRDR.ID_SR_REMARK_SRDR in (:id)';
        graph.linksDict['10_7'].condition = 'DD_OBJECT_DDOB.ID_OBJECT_DDOB in (:id)';

        //connect(remarkNode, projectNode);
        //connect(remarkNode, promptNode);
        //connect(remarkNode, statusNode);
        //connect(remarkNode, executorNode);
        //connect(remarkNode, authorNode);
        //connect(remarkNode, datefromNode);
        //connect(remarkNode, datetoNode);
        //connect(detailsNode, remarkNode);
        //connect(addNode, remarkNode);

        return graph;
    }
}