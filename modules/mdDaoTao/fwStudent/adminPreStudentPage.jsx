import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage, deleteStudent } from './redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';


class PreStudenModal extends AdminModal {
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
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại không được trống!', 'danger');
            this.itemPhoneNumber.focus();
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
        title: 'Ứng viên',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.itemLastname = e} label='Họ' />
            <FormTextBox className='col-md-6' ref={e => this.itemFirstname = e} label='Tên' />
            <FormTextBox className='col-md-6' ref={e => this.itemEmail = e} type='email' label='Email' />
            <FormTextBox className='col-md-6' ref={e => this.itemPhoneNumber = e} type='phone' label='Số điện thoại' />
            <FormSelect className='col-md-6' ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} />
            <FormSelect className='col-md-6' ref={e => this.states = e} label='Loại khóa học' data={this.props.states} />
        </div>
    });
}
class PreStudentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getStudentPage(1, 50, undefined);
        T.onSearch = (searchText) => this.props.getStudentPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.preStudenModal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên', 'Bạn có chắc muốn xoá ứng viên này?', true, isConfirm =>
    isConfirm && this.props.deleteStudent(item._id));
    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: '20%' }}>Di động</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.user && item.user.email} />
                    <TableCell type='text' content={T.mobileDisplay(item.user && item.user.phoneNumber)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}/>
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên',
            breadcrumb: ['Ứng viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getStudentPage} />
                <PreStudenModal ref={e => this.preStudenModal = e} />
            </>,
            // onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student });
const mapActionsToProps = { getStudentPage, deleteStudent };
export default connect(mapStateToProps, mapActionsToProps)(PreStudentPage);
