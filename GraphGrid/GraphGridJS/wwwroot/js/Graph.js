export function CreateGraph() {
    return new Graph();
}

export default class Graph {
    constructor() {
        this.nodesDict = {};
        this.linksDict = {};

        this.waveCache = {};

        this.nodeCount = 0;

        this.lastWaveInd = 0;
    }

    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // Возвращает UID волны, используемый при кешировании волн
    getWaveUid(e) {
        const arr = [e.waveType, e.withStartNodes, e.markVisited, e.allParentsVisited, e.moveType];
        for (let node of e.nodes) {
            arr.push(node.id);
        }
        return arr.join('_');
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // посещает узлы из списка list волной
    visitNodesByWave(e) {
        if (!e || !e.list || e.list.length <= 0) return;

        // если запущена новая однотипная волна, то нет смысла продолжать текущую
        if (e.waveType == this.lastWaveType && e.waveInd < this.lastWaveInd) return;

        const node = e.list.shift();

        if (e.markVisited) {
            node.visited = true;
        }

        if (node.visitByWave) {
            node.visitByWave(e);
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // возвращает истину, если при формировании списка посещаемых волной узлов нужно не использовать связь по каким-то причинам
    skipLink(link, waveType) {
        return false;
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // очищает пометки о посещении волной
    clearWaveVisits() {
        for (let id in this.nodesDict) {
            this.nodesDict[id]._waveNum = -1;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------

    // Генерирует волну, которая сначала проходит первый уровень узлов, ссылающихся на начальный узел, затем волна распространяется на их прямые потомки и т.д. пока волна не охватит все
    // непосещенные узлы, каким-то образом зависящие от начального. Решает проблему, заключающуюся в том, что если узлы из цикла находятся в виде формы (мастер + детальные),
    // то обновлять нужно сначала узлы в виде фильтра, потом мастера, а потом детальные
    // nodes                - массив узлов, инициирующих волну
    // waveType             - тип волны
    // withStartNodes       - вызывать реакцию на волну в стартовых узлах
    // markVisited          - помечать visited = true узлы, посещенные волной
    // allParentsVisited    - помещать в очередь только те узлы, у которых волной посещены все родители
    // moveType             - способ распространения волны по графу: fromParent - от родителя к детям, fromChild - от ребенка к родителям
    triggerWave(e) {
        e = e || {};

        if (this._isMakingWave || !e.nodes || e.nodes.length <= 0) return;

        if (e.waveType === undefined) e.waveType = WaveType.value;
        if (e.withStartNodes === undefined) e.withStartNodes = true;
        if (e.moveType === undefined) e.moveType = MoveType.fromParent;

        e.list = [];

        // текущая конфигурация волны
        e.waveUid = this.getWaveUid(e);

        this.lastWaveType = e.waveType;
        e.waveInd = ++this.lastWaveInd;

        // выставляем у графа признак "пущена волна"
        this._isMakingWave = true;

        // пытаемся найти готовую волну среди закешированных волн
        let _cachedWave = this.waveCache[e.waveUid];
        if (!this.noCachWave && _cachedWave) {
            // удалось найти закешированную волну, просто проходим по ней
            Object.assign(e.list, _cachedWave);
            this.visitNodesByWave(e);
            this._isMakingWave = false;
            return;
        }

        _cachedWave = [];

        let error;
        try {
            // очищаем пометки узлов о посещении волной
            this.clearWaveVisits();

            // уровень волны
            let waveNum = 0;

            // ставим пометку, что все начальные узлы посещены волной 
            for (let node of e.nodes) {
                // эта пометка ставится здесь, т.к. она нужна вне зависимости от withStartNodes
                node._waveNum = waveNum;

                if (e.withStartNodes) {
                    _cachedWave.push(node);
                }
            }

            // признак, что найден хоть один непосещенный потомок следующего уровня
            let found = true;
            // нужно добавить найденный узел в список текущего уровня волны
            let needAdd;

            while (found && this.nodeCount > waveNum) {
                found = false;
                waveNum++;

                const currWaveNodes = [];

                for (let id in this.nodesDict) {
                    let node = this.nodesDict[id];
                    // текущий узел должен браться из еще не посещенных волной
                    if (node._waveNum >= 0) continue;

                    needAdd = false;

                    // изменено: если включен режим allParentsVisited == false, то сначала собираем узлы, у которых все родительские посещены волной, а потом все, у которых посещен хотя бы один родительский узел

                    // если moveType == MoveType.All, то будут собраны все соседние узлы, и по родительским, и по дочерним
                    if (e.moveType != MoveType.fromChild) {
                        // проверяем, что у узла все родительские узлы были посещены волной
                        for (let lid in node.parentLinks) {
                            let link = node.parentLinks[lid];
                            // дополнительная проверка skipLink может запретить включение узла в список, несмотря на то, что он связан с предыдущим уровнем
                            needAdd = link.parent._waveNum >= 0 && link.parent._waveNum < waveNum && !this.skipLink(link, e.waveType);

                            if (!e.allParentsVisited && needAdd || e.allParentsVisited && !needAdd) break;
                        }
                    }

                    if ((!needAdd || e.allParentsVisited) && e.moveType != MoveType.fromParent) {
                        // теперь среди дочерних узлов ищем хотя бы один, посещенный волной (если allParentsVisited == true, то все дочерние узлы должны быть посещены волной)
                        for (let lid in node.childLinks) {
                            let link = node.childLinks[lid];
                            // дополнительная проверка skipLink может запретить включение узла в список, несмотря на то, что он связан с предыдущим уровнем
                            needAdd = link.child._waveNum >= 0 && link.child._waveNum < waveNum && !this.skipLink(link, e.waveType);
                            if (!e.allParentsVisited && needAdd || e.allParentsVisited && !needAdd) break;
                        }
                    }

                    if (needAdd) {
                        node._waveNum = waveNum;

                        currWaveNodes.push(node);

                        found = true;
                    }
                }

                if (!e.allParentsVisited) {
                    let added = false;
                    // берем в волну только те узлы, у которых среди родителей либо предыдущая волна, либо нет номера волны вообще
                    for (let i = currWaveNodes.length - 1; i >= 0; i--) {
                        let node = currWaveNodes[i];
                        if (e.moveType != MoveType.fromChild && !this.hasParentWithSameWave(node)) {
                            _cachedWave.push(node);
                            currWaveNodes.splice(i, 1);
                            added = true;
                        }
                        else if (e.moveType != MoveType.fromParent && !this.hasChildWithSameWave(node)) {
                            _cachedWave.push(node);
                            currWaveNodes.splice(i, 1);
                            added = true;
                        }
                    }

                    // оставшиеся узлы-претенденты на текщий номер волны возвращаем в пул непосещенных волной узлов
                    // они будут гарантированно посещены следующей волной
                    for (let node of currWaveNodes) {
                        // если не удалось добавить ни одного, то это означает, что все узлы-претенденты входят в циклы
                        // (у каждого был найден среди родительских узел из этого же номера волны) - добавляем их всех
                        if (!added && node.inCycle) {
                            _cachedWave.push(node);
                        }
                        else {
                            node._waveNum = -1;
                        }
                    }
                }
                else if (currWaveNodes.length > 0) {
                    Array.prototype.push.apply(_cachedWave, currWaveNodes);
                }
            }

            // после определения списка узлов, добавленных в порядке возрастания номера волны, проходим по этим узлам
            Object.assign(e.list, _cachedWave);
            this.visitNodesByWave(e);
        }
        catch (x) {
            error = true;
            if (this.debug) alert(x);
        }
        finally {
            this.clearWaveVisits();
            this._isMakingWave = false;

            // если проход волн закончился неудачей, то кешировать последовательность нет смысла
            if (!error) {
                this.waveCache[e.waveUid] = _cachedWave;
            }
        }
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // возвращает истину, если среди родительских узлов есть хотя бы один с тем же номером волны
    hasParentWithSameWave(node) {
        if (!node) return;

        for (let lid in node.parentLinks) {
            if (node.parentLinks[lid].parent._waveNum == node._waveNum) return true;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // возвращает истину, если среди родительских узлов есть хотя бы один с тем же номером волны
    hasChildWithSameWave(node) {
        if (!node) return;

        for (let lid in node.childLinks) {
            if (node.childLinks[lid].child._waveNum == node._waveNum) return true;
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    // помечает все узлы графа, которые входят хотя бы в один цикл
    markCycles() {
        // Если вершина имеет только входные или только выходные дуги, то она явно не входит ни в один цикл. Можно удалить все такие вершины из графа 
        // вместе со связанными с ними дугами. В результате появятся новые вершины, имеющие только входные или выходные дуги. Они также удаляются. 
        // Итерации повторяются до тех пор, пока граф не перестанет изменяться. Отсутствие изменений свидетельствует об отсутствии циклов, 
        // если все вершины были удалены. Все оставшиеся вершины обязательно принадлежат циклам.
        const hasParents = function (node) {
            for (let lid in node.parentLinks) {
                if (!node.parentLinks[lid].parent.excluded) return true;
            }
        };

        const hasChildren = function (node) {
            for (let lid in node.childLinks) {
                if (node.childLinks[lid].child.excluded) return true;
            }
        };

        // признак, что на текущей итерации было произведено удаление висячих узлов
        let changesDone = true;

        while (changesDone) {
            changesDone = false;

            for (let id in this.nodesDict) {
                let node = this.nodesDict[id];
                if (node.excluded) continue;

                // если узел висячий в какую-либо из сторон, или вообще несвязанный
                if (!hasParents(node) || !hasChildren(node)) {
                    // исключаем этот узел из списка рассматриваемых
                    node.excluded = true;
                    changesDone = true;
                }
            }
        }

        for (let id in this.nodesDict) {
            let node = this.nodesDict[id];
            if (node.excluded) {
                delete node.excluded;
            }
            else {
                node.inCycle = true;
            }
        }
    };
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}