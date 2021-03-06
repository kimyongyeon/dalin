// ax5.ui.grid.layout
(function () {

    let GRID = ax5.ui.grid,
        U = ax5.util;

    const init = function () {

    };

    const clearGroupingData = function (_list) {
        let i = 0, l = _list.length, returnList = [];
        for (; i < l; i++) {
            if (_list[i] && !_list[i]["__isGrouping"]) {
                if (_list[i][this.config.columnKeys.selected]) {
                    this.selectedDataIndexs.push(i);
                }
                returnList.push(jQuery.extend({}, _list[i]));
            }
        }
        return returnList;
    };

    const initData = function (_list) {
        this.selectedDataIndexs = [];
        let i = 0, l = _list.length,
            returnList = [],
            appendIndex = 0,
            dataRealRowCount = 0;

        if (this.config.body.grouping) {
            let groupingKeys = U.map(this.bodyGrouping.by, function () {
                return {
                    key: this,
                    compareString: "",
                    grouping: false,
                    list: []
                }
            });
            let gi = 0, gl = groupingKeys.length, compareString, appendRow = [], ari;
            for (; i < l + 1; i++) {
                gi = 0;
                if (_list[i] && _list[i][this.config.columnKeys.deleted]) {
                    this.deletedList.push(_list[i]);
                } else {
                    compareString = "";
                    appendRow = [];
                    for (; gi < gl; gi++) {
                        if (_list[i]) {
                            compareString += "$|$" + _list[i][groupingKeys[gi].key];
                        }
                        if (appendIndex > 0 && compareString != groupingKeys[gi].compareString) {
                            var appendRowItem = {keys: [], labels: [], list: groupingKeys[gi].list};
                            for (var ki = 0; ki < gi + 1; ki++) {
                                appendRowItem.keys.push(groupingKeys[ki].key);
                                appendRowItem.labels.push(_list[i - 1][groupingKeys[ki].key]);
                            }
                            appendRow.push(appendRowItem);
                            groupingKeys[gi].list = [];
                        }
                        groupingKeys[gi].list.push(_list[i]);
                        groupingKeys[gi].compareString = compareString;
                    }

                    ari = appendRow.length;
                    while (ari--) {
                        returnList.push({__isGrouping: true, __groupingList: appendRow[ari].list, __groupingBy: {keys: appendRow[ari].keys, labels: appendRow[ari].labels}});
                    }

                    if (_list[i]) {
                        if (_list[i][this.config.columnKeys.selected]) {
                            this.selectedDataIndexs.push(i);
                        }
                        dataRealRowCount = _list[i]["__index"] = i;
                        returnList.push(_list[i]);
                        appendIndex++;
                    }
                }
            }
        }
        else {
            for (; i < l; i++) {
                if (_list[i] && _list[i][this.config.columnKeys.deleted]) {
                    this.deletedList.push(_list[i]);
                } else if (_list[i]) {
                    if (_list[i][this.config.columnKeys.selected]) {
                        this.selectedDataIndexs.push(i);
                    }
                    // __index변수를 추가하여 lineNumber 에 출력합니다. (body getFieldValue 에서 출력함)
                    _list[i]["__index"] = i;
                    dataRealRowCount++;
                    returnList.push(_list[i]);
                }
            }
        }

        // 원본 데이터의 갯수
        // grouping은 제외하고 수집됨.
        this.xvar.dataRealRowCount = dataRealRowCount;
        return returnList;
    };

    const arrangeData4tree = function (_list) {
        let li = _list.length;
        let keys = this.config.tree.columnKeys;
        let hashDigit = this.config.tree.hashDigit;
        let listIndexMap = {};
        let i = 0, seq = 0;

        while (li--) {
            delete _list[li][keys.parentHash];
            delete _list[li][keys.selfHash];
            //delete _list[li][keys.childrenLength];
        }

        /// 루트 아이템 수집
        i = 0;
        seq = 0;
        li = _list.length;
        for (; i < li; i++) {
            if (_list[i]) {
                listIndexMap[_list[i][keys.selfKey]] = i; // 인덱싱

                if (U.number(_list[i][keys.parentKey]) === 0) { // 최상위 아이템인 경우
                    _list[i][keys.parentKey] = "0";
                    _list[i][keys.children] = [];
                    _list[i][keys.parentHash] = U.setDigit("0", hashDigit);
                    _list[i][keys.selfHash] = U.setDigit("0", hashDigit) + "." + U.setDigit(seq, hashDigit);
                    _list[i][keys.depth] = 0;
                    _list[i][keys.hidden] = false;

                    seq++;
                }
            }
        }

        /// 자식 아이템 수집
        i = 0;
        for (; i < li; i++) {
            let _parent, _parentHash;
            if (_list[i] && _list[i][keys.parentKey] && typeof _list[i][keys.parentHash] === "undefined") {

                if (_parent = _list[listIndexMap[_list[i][keys.parentKey]]]) {
                    _parentHash = _parent[keys.selfHash];
                    _list[i][keys.children] = [];
                    _list[i][keys.parentHash] = _parentHash;
                    _list[i][keys.selfHash] = _parentHash + "." + U.setDigit(_parent[keys.children].length, hashDigit);
                    _list[i][keys.depth] = _parent[keys.depth] + 1;
                    if (_parent[keys.collapse] || _parent[keys.hidden]) _list[i][keys.hidden] = true;
                    _parent[keys.children].push(_list[i][keys.selfKey]);
                } else {
                    _list[i][keys.parentKey] = "0";
                    _list[i][keys.children] = [];
                    _list[i][keys.parentHash] = U.setDigit("0", hashDigit);
                    _list[i][keys.selfHash] = U.setDigit("0", hashDigit) + "." + U.setDigit(seq, hashDigit);
                    _list[i][keys.hidden] = false;

                    seq++;
                }
            }
        }

        this.listIndexMap = listIndexMap;

        return _list;
    };

    const getProxyList = function (_list) {
        let i = 0, l = _list.length, returnList = [];
        for (; i < l; i++) {

            if (_list[i] && !_list[i][this.config.tree.columnKeys.hidden]) {
                _list[i].__origin_index__ = i;
                returnList.push(_list[i]);
            }
        }
        return returnList;
    };

    const set = function (data) {
        if (U.isArray(data)) {

            this.page = null;
            if (this.config.tree.use) {
                this.list = arrangeData4tree.call(this,
                    (!this.config.remoteSort && Object.keys(this.sortInfo).length) ? sort.call(this, this.sortInfo, data) : data
                );
                this.proxyList = getProxyList.call(this, this.list);
            } else {
                this.proxyList = null;
                this.list = initData.call(this,
                    (!this.config.remoteSort && Object.keys(this.sortInfo).length) ? sort.call(this, this.sortInfo, data) : data
                );
            }
            this.deletedList = [];

        } else if ("page" in data) {

            this.page = jQuery.extend({}, data.page);
            if (this.config.tree.use) {
                this.list = arrangeData4tree.call(this,
                    (!this.config.remoteSort && Object.keys(this.sortInfo).length) ? sort.call(this, this.sortInfo, data.list) : data.list
                );
                this.proxyList = getProxyList.call(this, this.list);
            } else {
                this.list = initData.call(this,
                    (!this.config.remoteSort && Object.keys(this.sortInfo).length) ? sort.call(this, this.sortInfo, data.list) : data.list
                );
            }
            this.deletedList = [];

        }

        this.needToPaintSum = true;
        this.xvar.frozenRowIndex = (this.config.frozenRowIndex > this.list.length) ? this.list.length : this.config.frozenRowIndex;
        this.xvar.paintStartRowIndex = undefined; // 스크롤 포지션 저장변수 초기화
        GRID.page.navigationUpdate.call(this);

        if (this.config.body.grouping) {

        }
        return this;
    };

    const get = function (_type) {
        return {
            list: this.list,
            page: this.page
        };
    };

    const getList = function (_type) {
        let returnList = [];
        let i = 0, l = this.list.length;
        switch (_type) {
            case "modified":
                for (; i < l; i++) {
                    if (this.list[i] && !this.list[i]["__isGrouping"] && this.list[i][this.config.columnKeys.modified]) {
                        returnList.push(jQuery.extend({}, this.list[i]));
                    }
                }
                break;
            case "selected":
                for (; i < l; i++) {
                    if (this.list[i] && !this.list[i]["__isGrouping"] && this.list[i][this.config.columnKeys.selected]) {
                        returnList.push(jQuery.extend({}, this.list[i]));
                    }
                }
                break;
            case "deleted":
                //_list = GRID.data.clearGroupingData(this.list);
                returnList = [].concat(this.deletedList);
                break;
            default:
                returnList = GRID.data.clearGroupingData.call(this, this.list);
        }
        return returnList;
    };

    const add = function (_row, _dindex, _options) {
        let list = (this.config.body.grouping) ? clearGroupingData.call(this, this.list) : this.list;
        let processor = {
            "first": function () {
                list = [].concat(_row).concat(list);
            },
            "last": function () {
                list = list.concat([].concat(_row));
            }
        };

        if (typeof _dindex === "undefined") _dindex = "last";
        if (_dindex in processor) {
            _row[this.config.columnKeys.modified] = true;
            processor[_dindex].call(this, _row);
        } else {
            if (!U.isNumber(_dindex)) {
                throw 'invalid argument _dindex';
            }
            //
            list = list.splice(_dindex, [].concat(_row));
        }

        if (this.config.body.grouping) {
            list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    list
                )
            );
        } else if (_options && _options.sort && Object.keys(this.sortInfo).length) {
            list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    list
                )
            );
        } else {
            list = initData.call(this, list);
        }

        this.list = list;

        this.needToPaintSum = true;
        this.xvar.frozenRowIndex = (this.config.frozenRowIndex > this.list.length) ? this.list.length : this.config.frozenRowIndex;
        this.xvar.paintStartRowIndex = undefined; // 스크롤 포지션 저장변수 초기화
        GRID.page.navigationUpdate.call(this);
        return this;
    };

    /**
     * list에서 완전 제거 하는 경우 사용.
     * ax5grid.data.remove
     */
    const remove = function (_dindex) {
        let list = (this.config.body.grouping) ? clearGroupingData.call(this, this.list) : this.list;
        let processor = {
            "first": function () {
                list.splice(_dindex, 1);
            },
            "last": function () {
                var lastIndex = list.length - 1;
                list.splice(lastIndex, 1);
            }
        };

        if (typeof _dindex === "undefined") _dindex = "last";
        if (_dindex in processor) {
            processor[_dindex].call(this, _dindex);
        } else {
            if (!U.isNumber(_dindex)) {
                throw 'invalid argument _dindex';
            }
            //
            list.splice(_dindex, 1);
        }

        if (this.config.body.grouping) {
            list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    list
                )
            );
        } else if (Object.keys(this.sortInfo).length) {
            list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    list
                )
            );
        } else {
            list = initData.call(this, list);
        }

        this.list = list;

        this.needToPaintSum = true;
        this.xvar.frozenRowIndex = (this.config.frozenRowIndex > this.list.length) ? this.list.length : this.config.frozenRowIndex;
        this.xvar.paintStartRowIndex = undefined; // 스크롤 포지션 저장변수 초기화
        GRID.page.navigationUpdate.call(this);
        return this;
    };


    /**
     * list에서 deleted 처리 repaint
     * ax5grid.data.deleteRow
     */
    const deleteRow = function (_dindex) {
        let list = (this.config.body.grouping) ? clearGroupingData.call(this, this.list) : this.list;
        let processor = {
            "first": function () {
                list[0][this.config.columnKeys.deleted] = true;
            },
            "last": function () {
                list[list.length - 1][this.config.columnKeys.deleted] = true;
            },
            "selected": function () {
                var i = list.length;
                while (i--) {
                    if (list[i][this.config.columnKeys.selected]) {
                        list[i][this.config.columnKeys.deleted] = true;
                    }
                }
            }
        };

        if (typeof _dindex === "undefined") _dindex = "last";
        if (_dindex in processor) {
            processor[_dindex].call(this, _dindex);
        } else {
            if (!U.isNumber(_dindex)) {
                throw 'invalid argument _dindex';
            }
            list[_dindex][this.config.columnKeys.deleted] = true;
        }

        if (this.config.body.grouping) {
            list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    list
                )
            );
        } else if (Object.keys(this.sortInfo).length) {
            list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    list
                )
            );
        } else {
            list = initData.call(this, list);
        }

        this.list = list;

        this.needToPaintSum = true;
        this.xvar.frozenRowIndex = (this.config.frozenRowIndex > this.list.length) ? this.list.length : this.config.frozenRowIndex;
        this.xvar.paintStartRowIndex = undefined; // 스크롤 포지션 저장변수 초기화
        GRID.page.navigationUpdate.call(this);
        return this;
    };

    const update = function (_row, _dindex) {
        if (!U.isNumber(_dindex)) {
            throw 'invalid argument _dindex';
        }
        //
        this.needToPaintSum = true;
        this.list.splice(_dindex, 1, _row);

        if (this.config.body.grouping) {
            this.list = initData.call(this, clearGroupingData.call(this, this.list));
        }
    };

    const setValue = function (_dindex, _key, _value) {
        let originalValue = getValue.call(this, _dindex, _key);
        this.needToPaintSum = true;

        if (originalValue !== _value) {
            if (/[\.\[\]]/.test(_key)) {
                try {
                    this.list[_dindex][this.config.columnKeys.modified] = true;
                    (Function("val", "this" + GRID.util.getRealPathForDataItem(_key) + " = val;")).call(this.list[_dindex], _value);
                } catch (e) {

                }
            } else {
                this.list[_dindex][this.config.columnKeys.modified] = true;
                this.list[_dindex][_key] = _value;
            }

            if (this.onDataChanged) {
                this.onDataChanged.call({
                    self: this,
                    list: this.list,
                    dindex: _dindex,
                    item: this.list[_dindex],
                    key: _key,
                    value: _value
                });
            }
        }

        return true;
    };

    let getValue = function (_dindex, _key, _value) {
        let list = this.list;

        if (/[\.\[\]]/.test(_key)) {
            try {
                _value = (Function("", "return this" + GRID.util.getRealPathForDataItem(_key) + ";")).call(list[_dindex]);
            } catch (e) {

            }
        } else {
            _value = list[_dindex][_key];
        }
        return _value;
    };

    const clearSelect = function () {
        this.selectedDataIndexs = [];
    };

    const select = function (_dindex, _selected, _options) {
        let cfg = this.config;

        if (!this.list[_dindex]) return false;
        if (this.list[_dindex].__isGrouping) return false;
        if (this.list[_dindex][cfg.columnKeys.disableSelection]) return false;

        if (typeof _selected === "undefined") {
            if (this.list[_dindex][cfg.columnKeys.selected] = !this.list[_dindex][cfg.columnKeys.selected]) {
                this.selectedDataIndexs.push(_dindex);
            }
        } else {
            if (this.list[_dindex][cfg.columnKeys.selected] = _selected) {
                this.selectedDataIndexs.push(_dindex);
            }
        }

        if (this.onDataChanged && _options && _options.internalCall) {
            this.onDataChanged.call({
                self: this,
                list: this.list,
                dindex: _dindex,
                item: this.list[_dindex],
                key: cfg.columnKeys.selected,
                value: this.list[_dindex][cfg.columnKeys.selected]
            });
        }

        return this.list[_dindex][cfg.columnKeys.selected];
    };

    const selectAll = function (_selected, _options) {
        let cfg = this.config,
            dindex = this.list.length;

        if (typeof _selected === "undefined") {
            while (dindex--) {
                if (this.list[dindex].__isGrouping) continue;
                if (_options && _options.filter) {
                    if (_options.filter.call(this.list[dindex]) !== true) {
                        continue;
                    }
                }
                if (this.list[dindex][cfg.columnKeys.disableSelection]) continue;

                if (this.list[dindex][cfg.columnKeys.selected] = !this.list[dindex][cfg.columnKeys.selected]) {
                    this.selectedDataIndexs.push(dindex);
                }
            }
        } else {
            while (dindex--) {
                if (this.list[dindex].__isGrouping) continue;
                if (_options && _options.filter) {
                    if (_options.filter.call(this.list[dindex]) !== true) {
                        continue;
                    }
                }
                if (this.list[dindex][cfg.columnKeys.disableSelection]) continue;

                if (this.list[dindex][cfg.columnKeys.selected] = _selected) {
                    this.selectedDataIndexs.push(dindex);
                }
            }
        }

        if (this.onDataChanged && _options && _options.internalCall) {
            this.onDataChanged.call({
                self: this,
                list: this.list
            });
        }

        return this.list;
    };

    const sort = function (_sortInfo, _list) {
        let self = this, list = _list || this.list, sortInfoArray = [];
        let getKeyValue = function (_item, _key, _value) {
            if (/[\.\[\]]/.test(_key)) {
                try {
                    _value = (Function("", "return this" + GRID.util.getRealPathForDataItem(_key) + ";")).call(_item);
                } catch (e) {
                }
            } else {
                _value = _item[_key];
            }
            return _value;
        };

        for (let k in _sortInfo) {
            sortInfoArray[_sortInfo[k].seq] = {key: k, order: _sortInfo[k].orderBy};
        }
        sortInfoArray = U.filter(sortInfoArray, function () {
            return typeof this !== "undefined";
        });

        let i = 0, l = sortInfoArray.length, _a_val, _b_val;

        list.sort(function (_a, _b) {
            for (i = 0; i < l; i++) {
                _a_val = getKeyValue(_a, sortInfoArray[i].key);
                _b_val = getKeyValue(_b, sortInfoArray[i].key);

                if (typeof _a_val !== typeof _b_val) {
                    _a_val = '' + _a_val;
                    _b_val = '' + _b_val;
                }
                if (_a_val < _b_val) {
                    return (sortInfoArray[i].order === "asc") ? -1 : 1;
                } else if (_a_val > _b_val) {
                    return (sortInfoArray[i].order === "asc") ? 1 : -1;
                }
            }
        });

        if (_list) {
            return list;
        } else {
            this.xvar.frozenRowIndex = (this.config.frozenRowIndex > this.list.length) ? this.list.length : this.config.frozenRowIndex;
            this.xvar.paintStartRowIndex = undefined; // 스크롤 포지션 저장변수 초기화
            GRID.page.navigationUpdate.call(this);
            return this;
        }
    };

    const append = function (_list, _callback) {
        let self = this;
        this.list = this.list.concat([].concat(_list));

        this.appendProgress = true;
        GRID.page.statusUpdate.call(this);


        if (this.appendDebouncer) {
            if (self.appendDebounceTimes < this.config.debounceTime / 10) {
                clearTimeout(this.appendDebouncer);
                self.appendDebounceTimes++;
            } else {
                self.appendDebounceTimes = 0;
                appendIdle.call(self);
                _callback();
                return false;
            }
        }

        this.appendDebouncer = setTimeout(function () {
            self.appendDebounceTimes = 0;
            appendIdle.call(self);
            _callback();
        }, this.config.debounceTime);

        // todo : append bounce animation
    };

    const appendIdle = function () {
        this.appendProgress = false;
        if (this.config.body.grouping) {
            this.list = initData.call(this,
                sort.call(this,
                    this.sortInfo,
                    this.list
                )
            );
        } else {
            this.list = initData.call(this, this.list);
        }

        this.needToPaintSum = true;
        this.xvar.frozenRowIndex = (this.config.frozenRowIndex > this.list.length) ? this.list.length : this.config.frozenRowIndex;
        this.xvar.paintStartRowIndex = undefined; // 스크롤 포지션 저장변수 초기화
        GRID.page.navigationUpdate.call(this);
    };

    const toggleCollapse = function (_dindex, _collapse) {
        let keys = this.config.tree.columnKeys, selfHash, originIndex;

        if (typeof _dindex === "undefined") return false;
        originIndex = this.proxyList[_dindex].__origin_index__;

        if (this.list[originIndex][keys.children]) {
            this.proxyList = []; // 리셋 프록시
            if (typeof _collapse == "undefined") {
                _collapse = !(this.list[originIndex][keys.collapse] || false);
            }

            this.list[originIndex][keys.collapse] = _collapse;
            selfHash = this.list[originIndex][keys.selfHash];

            let i = this.list.length;
            while (i--) {
                if (this.list[i]) {
                    // console.log(this.list[i][keys.parentHash].substr(0, selfHash.length), selfHash);
                    if (this.list[i][keys.parentHash].substr(0, selfHash.length) === selfHash) {
                        this.list[i][keys.hidden] = _collapse;
                    }

                    if (!this.list[i][keys.hidden]) {
                        this.proxyList.push(this.list[i]);
                    }
                }
            }

            return true;
        } else {
            return false;
        }
    };

    GRID.data = {
        init: init,
        set: set,
        get: get,
        getList: getList,
        getProxyList: getProxyList,
        setValue: setValue,
        getValue: getValue,
        clearSelect: clearSelect,
        select: select,
        selectAll: selectAll,
        add: add,
        remove: remove,
        deleteRow: deleteRow,
        update: update,
        sort: sort,
        initData: initData,
        clearGroupingData: clearGroupingData,
        append: append,
        toggleCollapse: toggleCollapse
    };
})();