import React from 'react';
import { connect } from 'react-redux';
import { getCertificatePage, updateCertificate } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormDatePicker } from 'view/component/AdminPage';

class CertificateModal extends AdminModal {
    state = {};
    onShow = (item) => {
        let { _id, lastname, firstname, identityCard, courseType, course, ngayNhanChungChiHoanThanhKhoaHoc, ngayNhanGiayPhepLaiXe } = item || { _id: null, student: null, ngayNhanChungChiHoanThanhKhoaHoc: '', ngayNhanGiayPhepLaiXe: '' };
        this.itemStudent.value(lastname + ' ' + firstname);
        this.itemIdentityCard.value(identityCard);
        this.itemCourseType.value(courseType ? courseType.title : '');
        this.itemCourse.value(course ? course.name : '');
        this.itemNgayNhanChungChiHoanThanhKhoaHoc.value(ngayNhanChungChiHoanThanhKhoaHoc);
        this.itemNgayNhanGiayPhepLaiXe.value(ngayNhanGiayPhepLaiXe);

        this.setState({ _id, ngayNhanChungChiHoanThanhKhoaHoc, ngayNhanGiayPhepLaiXe });
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
            title: 'Chứng chỉ sơ cấp',
            size: 'large',
            body:
                <>
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.itemStudent = e} label='Học viên' readOnly={true} />
                    <FormTextBox className='col-md-6' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={true} />
                    <FormTextBox className='col-md-6' ref={e => this.itemCourseType = e} label='Loại khóa học' readOnly={true} />
                    <FormTextBox className='col-md-6' ref={e => this.itemCourse = e} label='Khóa học' readOnly={true} />
                    <p className='col-md-6'>Đã nhận chứng chỉ hoàn thành khóa học: {this.state.ngayNhanChungChiHoanThanhKhoaHoc ? <b style={{color: 'green'}}>Đã nhận</b> : <b>Chưa nhận</b>}</p> 
                    <FormDatePicker className='col-md-6' ref={e => this.itemNgayNhanChungChiHoanThanhKhoaHoc = e} label='Ngày nhận chứng chỉ hoàn thành khóa học' readOnly={readOnly}/>
                    <p className='col-md-6'>Đã nhận giấy phép lái xe: {this.state.ngayNhanGiayPhepLaiXe ? <b style={{color: 'green'}}>Đã nhận</b> : <b>Chưa nhận</b>}</p> 

                    <FormDatePicker className='col-md-6' ref={e => this.itemNgayNhanGiayPhepLaiXe = e} label='Ngày nhận giấy phép lái xe' readOnly={readOnly} />
                </div>
                </>
        });
    }
}

class CertificationPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/certification', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            this.props.getCertificatePage(1, 50, {totNghiep:true});
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getCertificatePage(pageNumber, pageSize, { searchText,totNghiep:true }, (page) => {
            this.setState({ searchText, isSearching: false });
            done && done(page);
        }));
    }

    edit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    render() {
        const permission = this.getUserPermission('certificate');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.certificate && this.props.certificate.page ?
            this.props.certificate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '40%' }} nowrap='true'>Thông tin liên lạc</th>
                    <th style={{ width: '20%' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: '40%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đã nhận chứng chỉ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày nhận chứng chỉ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={<>{item.lastname} {item.firstname} <br/> {item.identityCard}</>} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' content={item.identityCard} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.courseType && item.courseType.title} />
                    <TableCell type='text' content={item.course && item.course.name} />
                    <TableCell type='link' style={{ textAlign: 'center', backgroundColor: item.ngayNhanChungChiHoanThanhKhoaHoc ? 'lightblue' : '' }} content={item.ngayNhanChungChiHoanThanhKhoaHoc ? 'Đã nhận' : 'Chưa nhận'} onClick={e => this.edit(e, item)} />
                    <TableCell type='link' content={item.ngayNhanChungChiHoanThanhKhoaHoc ? new Date(item.ngayNhanChungChiHoanThanhKhoaHoc).getShortText() : ''} onClick={e => this.edit(e, item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-certificate',
            title: 'Phát chứng chỉ sơ cấp',
            breadcrumb: ['Phát chứng chỉ sơ cấp'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.props.getCertificatePage} />
                    <CertificateModal ref={e => this.modal = e} update={this.props.updateCertificate} readOnly={!permission.write} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, certificate: state.trainning.certificate });
const mapActionsToProps = { getCertificatePage, updateCertificate };
export default connect(mapStateToProps, mapActionsToProps)(CertificationPage);