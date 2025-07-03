import { GraphClass } from '../Grid/Graph';
import { NodeStatus, FilterType } from '../Grid/Base';
export default class PMTest {

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

        const parentRemarkNode = { id: 11, entity: 'SrRemarkEntity', title: 'Родительское задание', status: NodeStatus.filter, keyField: 'ID_SR_REMARK_SRRM', schemeName: 'Remarks_scheme', inSchemeUid: '05' };

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

        return graph;
    }
}