import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel } from './redux';
import { getUser } from '../../_default/fwUser/redux';
import Pagination from 'view/component/Pagination';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';

//TODO: state=UngVien thì không cập nhật được => cần confirm trước khi chuyển thành UngVien
class EmailModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = ({ _id, firstname = '', lastname = '', email = '', phoneNumber = '', onUpdated, courseType = '', state = '' }) => {
        this.onUpdated = onUpdated;
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemEmail.value(email);
        this.itemPhoneNumber.value(phoneNumber);
        ajaxGetCourseType(courseType, data =>
            this.courseType.value(data && data.item ? { id: data.item._id, text: data.item.title } : null));
        this.states.value(state)

        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            courseType: this.courseType.value(),
            state: this.states.value(),
        };
        if (data.lastname == '') {
            T.notify('Họ không được trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.firstname == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.email == '' || !T.validateEmail(data.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.itemEmail.focus();
        } else {
            this.props.update(this.state._id, data, (error) => {
                if (this.onUpdated) this.onUpdated(error);
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Đăng ký tư vấn',
        body: <>
            <FormTextBox ref={e => this.itemLastname = e} label='Họ' />
            <FormTextBox ref={e => this.itemFirstname = e} label='Tên' />
            <FormTextBox ref={e => this.itemEmail = e} type='email' label='Email' />
            <FormTextBox ref={e => this.itemPhoneNumber = e} type='phone' label='Số điện thoại' />
            <FormSelect ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} />
            <FormSelect ref={e => this.states = e} label='Loại khóa học' data={this.props.states} />
        </>
    });
}

const stateMapper = {
    MoiDangKy: { text: 'Mới đăng ký', style: { color: 'black' } },
    DangLienHe: { text: 'Đang liên hệ', style: { color: '#1488DB' } },
    Huy: { text: 'Huỷ', style: { color: '#DC3545' } },
    UngVien: { text: 'Ứng viên', style: { color: '#28A745' } },
};
const states = Object.keys(stateMapper).map(key => ({ value: key, text: stateMapper[key].text }));
const states_select = Object.keys(stateMapper).map(key => ({ id: key, text: stateMapper[key].text }));

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

    edit = (e, item) => e.preventDefault() || this.emailModal.show(item);

    updateCourseType = (item, courseType) => this.props.updateCandidate(item._id, { courseType }, error => {
        //TODO: nếu error thì quay lại lựa chọn cũ
    });

    updateState = (item, state) => {
        this.props.updateCandidate(item._id, { state }, error => {
            //TODO: nếu error thì quay lại lựa chọn cũ
        });
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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const selectedState = stateMapper[item.state];
                const dropdownState = <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.value)} textStyle={selectedState.style} />;
                const dropdownCourseType = <Dropdown items={this.state.courseTypes} item={item.courseType ? item.courseType.title : ''} onSelected={e => { this.updateCourseType(item, e.value); }} />
                const dates = <>
                    <p style={{ margin: 0 }}>{item.staff ? item.staff.lastname + ' ' + item.staff.firstname : 'Chưa xử lý!'}</p>
                    <p style={{ margin: 0 }} className='text-secondary'>{new Date(item.createdDate).getText()}</p>
                    {item.modifiedDate ? <p style={{ margin: 0 }} className='text-success'>{new Date(item.modifiedDate).getText()}</p> : null}
                </>;
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} />
                        <TableCell content={item.email} />
                        <TableCell content={item.phoneNumber} />
                        <TableCell content={dropdownCourseType} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dates} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
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
                <EmailModal ref={e => this.emailModal = e} update={this.props.updateCandidate} states={states_select} />
            </>,
            onExport: permission.export ? this.props.exportCandidateToExcel : null,
        });
    }
}
const mapStateToProps = state => ({ system: state.system, candidate: state.candidate });
const mapActionsToProps = { getCourseTypeAll, getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel, getUser };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);