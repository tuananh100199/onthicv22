import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, AdminModal, FormFileBox, FormTextBox, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';


class EditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemFirstname.focus()));
    }

    onShow = (item, index) => {
        let { numberic, firstname, lastname, email, phoneNumber, courseType } = item || { firstname: '', lastname: '', email: '', phoneNumber: '', courseType: '' };
        this.setState({ num: numberic })
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemEmail.value(email);
        this.itemPhoneNumber.value(phoneNumber);
        this.itemCourseType.value(courseType);
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            courseType: this.itemCourseType.value(),
        };
        if (data.firstname == '') {
            T.notify('Tên ứng viên bị trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.lastname == '') {
            T.notify('Tên ứng viên bị trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.email == '') {
            T.notify('Email ứng viên bị trống!', 'danger');
            this.itemEmail.focus();
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại ứng viên bị trống!', 'danger');
            this.itemPhoneNumber.focus();
        } else if (data.courseType == '') {
            T.notify('Hạng đăng ký của ứng viên bị trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa ứng viên',
        size: 'large',
        body: (
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemFirstname = e} label='Họ ứng viên' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLastname = e} label='Tên ứng viên' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemCourseType = e} label='Hạng đăng ký' readOnly={this.props.readOnly} />
                </div>
            </div>),
    });
}
class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = {};
    onUploadSuccess = (data) => {
        this.setState(data);
    }
    showEditModal = (e, item) => e.preventDefault() || this.modalEdit.show(item);
    edit = (numberic, changes) => {
        this.setState(prevState => ({
            data: prevState.data.map(
                data => data.numberic === numberic ? { ...data, changes } : data
            )
        }))
        console.log(this.state.data)
    }
    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']),
            readOnly = !permission.write;
        const table = renderTable({
            getDataSource: () => this.state.data ? this.state.data : [],
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
                    <TableCell type='number' content={item.numberic} />
                    <TableCell type='link' content={item.firstname + ' ' + item.lastname} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='text' content={T.mobileDisplay(item.phoneNumber)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showEditModal} onDelete={this.edit} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên: ',
            breadcrumb: ['Ứng viên'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Upload danh sách ứng viên</h3>
                    <FormFileBox ref={e => this.fileBox = e} className='col-md-6' label='File excel ứng viên' uploadType='CandidateFile'
                        onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Danh sách ứng viên</h3>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <EditModal ref={e => this.modalEdit = e} readOnly={!permission.write} />
                <CirclePageButton type='save' onClick={() => alert('todo')} />
            </>,
            backRoute: '/user/pre-student',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
export default connect(mapStateToProps)(ImportPage);
