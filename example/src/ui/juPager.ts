import { h, Dispatch } from 'zaitun';

class juPage {
    groupNumber = 1;
    activePage = 1;
    linkList = [];
    totalRecords = 0;
    sspFn = null;
    data = [];
    _cachedData = [];
    pageChange = null;
    protected _prevActivePage = 0;
    diffPageAction = false;
    powerList = [];
    powerListBW = [];
    protected _pbdiff = 20;
    protected _pbtimes = 5;
    searchText = '';
    dispatch:Dispatch;
    model:any;
    totalPage:number;
    protected _sort;
    constructor() {

    }
    init() {
        return {
            pageSize: 10,
            linkPages: 10,
            enablePowerPage: false,
            nav: true,
            search: true
        };
    }
    view({ model, dispatch }) {
        this.dispatch = dispatch;
        this.model = model;
        this._calculatePagelinkes();
        const nav = h('nav', [
            h('ul.pagination.pagination-' + model.elmSize, [
                h('li.page-item', { key: 'start', class: { disabled: this._isDisabledPrev() } }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this._clickStart() } }, 'Start')]),
                h('li.page-item', { key: 'pre', class: { disabled: this._isDisabledPrev() } }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this._clickPrev() } }, '«')]),
                ...this.powerListBW.map((li, index) =>
                    h('li.page-item', { key: index + 'pbb' }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this.powerAction(li) } }, li)])
                ),
                ...this.linkList.map((li, index) =>
                    h('li.page-item', { key: index + 'n', class: { active: li === this.activePage } }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this.clickPage(li) } }, li)])
                ),
                ...this.powerList.map((li, index) =>
                    h('li.page-item', { key: index + 'pbf' }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this.powerAction(li) } }, li)])
                ),
                h('li.page-item', { key: 'next', class: { disabled: this._isDisabledNext() } }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this._clickNext() } }, '»')]),
                h('li.page-item', { key: 'end', class: { disabled: this._isDisabledNext() } }, [h('a.page-link', { props: { href: 'javascript:;' }, on: { click: () => this._clickEnd() } }, 'End')]),

            ])
        ]);
        const info = h('div.page-size', [
            h('span', 'Page Size'),
            h('select.form-control.form-control-' + model.elmSize, { props: { value: this.model.pageSize }, on: { change: (e:any) => this._changePageSize(e.target.value) } }, [
                h('option', { props: { value: 5 } }, '5'),
                h('option', { props: { value: 10 } }, '10'),
                h('option', { props: { value: 15 } }, '15'),
                h('option', { props: { value: 20 } }, '20'),
                h('option', { props: { value: 25 } }, '25'),
                h('option', { props: { value: 30 } }, '30'),
                h('option', { props: { value: 50 } }, '50'),
                h('option', { props: { value: 100 } }, '100')
            ]),
            h('span', `Page ${this.totalPage ? this.activePage : 0} of ${this.totalPage}`)
        ]);
        const elms = [];
        if (model.pagerInfo) { elms.push(h('div.col-12.col-md-auto', [info])); }
        if (model.nav) { elms.push(h('div.col', [nav])); }
        if (model.search) {
            elms.push(h('div.col-12.col-md-auto', [h('input.search.form-control.form-control-' + model.elmSize,
                { on: { keyup: (ev:any) => this.search(ev.target.value) }, props: { type: 'text', value: this.searchText, placeholder: 'Search...' } })]));
        }
        return h('div.row', elms);
    }
    update(model, action) {
        return model;
    }
    //public methods
    search(val) {
        this.activePage = 1;
        this.searchText = val;
        if (this.sspFn) {
            this.firePageChange();
        } else if (typeof this.model.searchFn === 'function') {
            this.data = val ? this.model.searchFn(this._cachedData, val.toLowerCase()) : this._cachedData;
            this.firePageChange();
        }
    }
    sort(sortProp, isAsc) {
        this._sort = sortProp + '|' + (isAsc ? 'desc' : 'asc');
        this.firePageChange();
    }
    refresh() {
        this._calculatePager();
        this.dispatch({ type: 'pager' });
    }
    setData(data) {
        this.data = data;
        if (this.model.search) {
            this._cachedData = data;
        }
        this.firePageChange();
    }
    firePageChange() {
       
        this.diffPageAction = this.activePage !== this._prevActivePage;
        this._prevActivePage = this.activePage;
        if (this.sspFn) {
            this.sspFn({ pageSize: this.model.pageSize, pageNo: this.activePage, searchText: this.searchText, sort: this._sort })
                .then(res => {
                    this.totalRecords = res.totalRecords;
                    this._setTotalPage();
                    this.pageChange(res.data);
                    this.refresh();
                });
        } else {
            if (!this.data) return;
            let startIndex = (this.activePage - 1) * this.model.pageSize;
            this.pageChange(this.data.slice(startIndex, startIndex + this.model.pageSize));
            this.refresh();
        }

    }
    clickPage(index) {
        this.activePage = index;
        this.firePageChange();
    }
    //end public methods
    protected _isUndef(p) {
        return p === undefined;
    }
    protected _changePageSize(size) {
        this.model.pageSize = +size;
        this.model.pageSize = this.model.pageSize;
        this.groupNumber = 1;
        this.activePage = 1;
        this.firePageChange()
    }
    protected _clickStart() {
        if (this.groupNumber > 1) {
            this.groupNumber = 1;
            this.activePage = 1;
            this.firePageChange();
        }
    }
    protected _clickEnd() {
        if (this._hasNext()) {
            this.groupNumber = parseInt((this.totalPage / this.model.linkPages).toString()) + ((this.totalPage % this.model.linkPages) ? 1 : 0);
            this.activePage = this.totalPage;
            this.firePageChange();
        }
    }
    protected _clickPrev() {
        this.groupNumber--;
        if (this.groupNumber <= 0) {
            this.groupNumber++;
        } else {
            this.firePageChange();
        }

    }
    protected _clickNext() {
        if (this._hasNext()) {
            this.groupNumber++;
            this.firePageChange();
        }
    }
    protected _isDisabledPrev() {
        if (this.sspFn) {
            return !(this.groupNumber > 1);
        }
        if (!this.data) {
            return true;
        }
        return !(this.groupNumber > 1);
    }
    protected _isDisabledNext() {
        if (this.sspFn) {
            return !this._hasNext();
        }
        if (!this.data) {
            return true;
        }
        return !this._hasNext();
    }
    protected _hasNext() {
        if (this.sspFn) {
            return this.totalPage > this.groupNumber * this.model.linkPages;
        }
        if (!this.data) false;
        let len = this.data.length;
        if (len == 0) return false;
        return this.totalPage > this.groupNumber * this.model.linkPages;
    }
    protected _calculatePager() {
        if (this.model.enablePowerPage) {
            this.calculateBackwordPowerList();
            this.calculateForwordPowerList();
        }
        this._calculatePagelinkes();
    }
    protected _calculatePagelinkes() {
        this._setTotalPage();
        let start = 1;
        if (this.groupNumber > 1) {
            start = (this.groupNumber - 1) * this.model.linkPages + 1;
        }
        let end = this.groupNumber * this.model.linkPages;
        if (end > this.totalPage) {
            end = this.totalPage;
        }
        this.linkList = [];
        for (var index = start; index <= end; index++) {
            this.linkList.push(index);
        }
    }
    protected _setTotalPage() {
        this.totalPage = 0;
        if (this.sspFn) {
            this.totalPage = parseInt((this.totalRecords / this.model.pageSize).toString()) + ((this.totalRecords % this.model.pageSize) > 0 ? 1 : 0);
            return;
        }
        if (!this.data) return;
        const len = this.data.length;
        if (len == 0) return;

        this.totalPage = parseInt((len / this.model.pageSize).toString()) + ((len % this.model.pageSize) > 0 ? 1 : 0);
    }
    // power action   
    powerAction(pageNo) {
        this.groupNumber = Math.ceil(pageNo / this.model.linkPages);
        this.activePage = pageNo;
        this.firePageChange();

    }
    calculateBackwordPowerList() {
        this.powerListBW = [];
        const curPos = this.groupNumber * this.model.linkPages + 1;
        if (curPos > this._pbdiff) {
            var index = curPos - this._pbdiff, times = this._pbtimes;
            while (index > 0 && times > 0) {
                this.powerListBW.push(index);
                index -= this._pbdiff;
                times--;
            }
            this.powerListBW.reverse();
        }
    }
    calculateForwordPowerList() {
        this.powerList = [];
        this._setTotalPage();
        let curPos = this.groupNumber * this.model.linkPages + 1,
            restPages = this.totalPage - curPos;
        if (restPages > this._pbdiff) {
            var index = curPos + this._pbdiff, times = this._pbtimes;
            while (index < this.totalPage && times > 0) {
                this.powerList.push(index);
                index += this._pbdiff;
                times--;
            }
        }
    }
}
export { juPage }