import React from 'react';
import { connect } from 'react-redux';
import { getLicenseTestPage, updateLicenseTest,createLicenseTest,deleteLicenseTest} from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormDatePicker } from 'view/component/AdminPage';
import T from 'view/js/common';

class LicenseTestModal extends AdminModal {
    state = {};
    onShow = (item) => {
        let { _id, title,date } = item ?item: { _id: null, title:'',date:'' };
        this.itemTitle.value(title);
        this.itemDate.value(date);
        this.setState({ _id });
    };

    onSubmit = () => {
        const data = { 
            title:this.itemTitle.value(),
            date:this.itemDate.value(),
        };
        if (data.title == '') {
            T.notify('Mã sát hạch không được trống!', 'danger');
            this.itemTitle.focus();
        }else{
            this.state._id ? this.props.update(this.state._id, data, this.hide)
            :this.props.create(data,this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Kỳ sát hạch',
            size: 'medium',
            body:
                <>
                <div className='row'>
                    <FormTextBox className='col-md-12' ref={e => this.itemTitle = e} label='Mã kỳ sát hạch' readOnly={readOnly} />
                    <FormDatePicker className='col-md-12' type='date-mask' ref={e => this.itemDate = e} label='Ngày sát hạch' readOnly={readOnly}/>
                </div>
                </>
        });
    }
}

class LicenseTestPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/license-test', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            this.props.getLicenseTestPage(1, 50, {});
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getLicenseTestPage(pageNumber, pageSize, { searchText }, (page) => {
            this.setState({ searchText, isSearching: false });
            done && done(page);
        }));
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa kỳ sát hạch', 'Bạn có chắc bạn muốn xóa kỳ sát hạch này?', true, isConfirm =>
    isConfirm && this.props.deleteLicenseTest(item._id));

    render() {
        const permission = this.getUserPermission('licenseTest');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.licenseTest && this.props.licenseTest.page ?
            this.props.licenseTest.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0};
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '70%' }} nowrap='true'>Mã sát hạch</th>
                    <th style={{ width: '30%' }} nowrap='true'>Ngày sát hạch</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Kỳ sát hạch',
            breadcrumb: ['Kỳ sát hạch'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination name='pageLicenseTest' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                        getPage={this.props.getLicenseTestPage} />
                    <LicenseTestModal ref={e => this.modal = e} update={this.props.updateLicenseTest} create = {this.props.createLicenseTest} readOnly={!permission.write} />
                </div>
            ),
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, licenseTest: state.trainning.licenseTest });
const mapActionsToProps = { getLicenseTestPage, updateLicenseTest,createLicenseTest,deleteLicenseTest };
export default connect(mapStateToProps, mapActionsToProps)(LicenseTestPage);