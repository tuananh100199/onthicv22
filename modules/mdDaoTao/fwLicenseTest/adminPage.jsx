import React from 'react';
import { connect } from 'react-redux';
import { getLicenseTestPage, updateLicenseTest } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormDatePicker } from 'view/component/AdminPage';

class CertificateModal extends AdminModal {
    state = {};
    onShow = (item) => {
        let { _id, title,date } = item || { _id: null, title:'',date:'' };
        this.itemTitle.value(title);
        this.itemDate.value(date);
        this.setState({ _id });
    };

    onSubmit = () => {
        const data = { 
            ngayNhanChungChiHoanThanhKhoaHoc: this.itemNgayNhanChungChiHoanThanhKhoaHoc.value(),
            ngayNhanGiayPhepLaiXe: this.itemNgayNhanGiayPhepLaiXe.value()
        };
        this.props.update(this.state._id, data, () => this.hide());
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Kỳ sát hạch',
            size: 'medium',
            body:
                <>
                <div className='row'>
                    <FormTextBox className='col-md-12' ref={e => this.title = e} label='Mã kỳ sát hạch' readOnly={true} />
                    <FormDatePicker className='col-md-12' ref={e => this.itemDate = e} label='Ngày sát hạch' readOnly={readOnly}/>
                </div>
                </>
        });
    }
}

class CertificatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/certificate', () => {
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

    render() {
        const permission = this.getUserPermission('licenseTest');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.certificate && this.props.certificate.page ?
            this.props.certificate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '40%' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: '20%' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: '40%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã nhận chứng chỉ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày nhận chứng chỉ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã nhận giấy phép lái xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày nhận giấy phép lái xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${item.lastname} ${item.firstname}`} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' content={item.identityCard} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.courseType && item.courseType.title} />
                    <TableCell type='text' content={item.course && item.course.name} />
                    <TableCell type='link' style={{ textAlign: 'center', backgroundColor: item.ngayNhanChungChiHoanThanhKhoaHoc ? 'lightblue' : '' }} content={item.ngayNhanChungChiHoanThanhKhoaHoc ? 'Đã nhận' : 'Chưa nhận'} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' content={item.ngayNhanChungChiHoanThanhKhoaHoc ? new Date(item.ngayNhanChungChiHoanThanhKhoaHoc).getShortText() : ''} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' style={{ textAlign: 'center', backgroundColor: item.ngayNhanGiayPhepLaiXe ? 'lightblue' : ''  }} content={item.ngayNhanGiayPhepLaiXe ? 'Đã nhận' : 'Chưa nhận'} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' content={item.ngayNhanGiayPhepLaiXe ? new Date(item.ngayNhanGiayPhepLaiXe).getShortText() : ''} onClick={e => this.edit(e, item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Phát chứng chỉ, giấy phép',
            breadcrumb: ['Phát chứng chỉ, giấy phép'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.props.getLicenseTestPage} />
                    <CertificateModal ref={e => this.modal = e} update={this.props.updateLicenseTest} readOnly={!permission.write} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, certificate: state.trainning.certificate });
const mapActionsToProps = { getLicenseTestPage, updateLicenseTest };
export default connect(mapStateToProps, mapActionsToProps)(CertificatePage);