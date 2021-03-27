import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';

//TODO: state=UngVien thì không cập nhật được => cần confirm trước khi chuyển thành UngVien

class EmailModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemEmail.focus()));
    }

    onShow = ({ _id, email = '', onUpdated }) => {
        this.onUpdated = onUpdated;
        this.itemEmail.value(email);
        this.setState({ _id });
    }

    onSubmit = () => {
        const email = this.itemEmail.value();
        if (email == '' || !T.validateEmail(email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.itemEmail.focus();
        } else {
            this.props.update(this.state._id, { email }, (error) => {
                if (this.onUpdated) this.onUpdated(error);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Email',
        body: <FormTextBox ref={e => this.itemEmail = e} label='Email' />
    });
}

const stateMapper = {
    MoiDangKy: { text: 'Mới đăng ký', style: { color: 'black' } },
    DangLienHe: { text: 'Đang liên hệ', style: { color: '#1488db' } },
    Huy: { text: 'Huỷ', style: { color: '#dc3545' } },
    UngVien: { text: 'Ứng viên', style: { color: '#28a745' } },
};
const states = Object.keys(stateMapper).map(key => ({ value: key, text: stateMapper[key].text }));

class CandidatePage extends AdminPage {
    state = { courseTypes: [] };
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCandidatePage();
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ value: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.onSearch = (searchText) => this.props.getCandidatePage(1, 50, searchText);
    }

    editEmail = (e, item) => e.preventDefault() || this.emailModal.show(item);

    updateCourseType = (item, courseType) => this.props.updateCandidate(item._id, { courseType }, error => {
        //TODO: nếu error thì quay lại lựa chọn cũ
    });

    updateState = (item, state) => {
        if (state == 'UngVien' && (item.email == '' || item.email == null)) {
            const onUpdated = error => {
                //TODO
            };
            this.emailModal.show({ ...item, onUpdated });
        } else {
            this.props.updateCandidate(item._id, { state }, error => {
                //TODO: nếu error thì quay lại lựa chọn cũ
            });
        }
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm =>
        isConfirm && this.props.deleteCandidate(item._id));

    render() {
        const permission = this.getUserPermission('candidate', ['read', 'write', 'delete', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.candidate && this.props.candidate.page ?
            this.props.candidate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và tên</th>
                    <th style={{ width: '50%' }}>Email</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nhân viên xử lý</th>
                    {permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                </tr>),
            renderRow: (item, index) => {
                const selectedState = stateMapper[item.state];
                const dropdownState = <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.value)} textStyle={selectedState.style} />;
                const dropdownCourseType = <Dropdown items={this.state.courseTypes} item={item.courseType ? item.courseType.title : ''} onSelected={e => this.updateCourseType(item, e.value)} />
                const dates = <>
                    <p style={{ margin: 0 }}>{item.staff ? item.staff.lastname + ' ' + item.staff.firstname : 'Chưa xử lý!'}</p>
                    <p style={{ margin: 0 }} className='text-secondary'>{new Date(item.createdDate).getText()}</p>
                    {item.modifiedDate ? <p style={{ margin: 0 }} className='text-success'>{new Date(item.modifiedDate).getText()}</p> : null}
                </>;

                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell content={item.lastname + ' ' + item.firstname} />
                        <TableCell content={item.email} />
                        <TableCell content={item.phoneNumber} />
                        <TableCell content={dropdownCourseType} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dates} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete}>
                            {permission.write &&
                                <a className='btn btn-primary' href='#' onClick={e => this.editEmail(e, item)}>
                                    <i className='fa fa-lg fa-envelope-o' />
                                </a>}
                        </TableCell>
                    </tr>);
            },
        });

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Đăng ký tư vấn',
            breadcrumb: ['Đăng ký tư vấn'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageCandidate' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCandidatePage} />
                <EmailModal ref={e => this.emailModal = e} update={this.props.updateCandidate} />
            </>,
            onExport: permission.export ? this.props.exportCandidateToExcel : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, candidate: state.candidate });
const mapActionsToProps = { getCourseTypeAll, getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);