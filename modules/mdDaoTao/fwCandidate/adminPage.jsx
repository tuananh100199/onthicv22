import React from 'react';
import { connect } from 'react-redux';
import { getCandidatePage, getCandidate, updateCandidate, deleteCandidate, exportCandidateToExcel } from './redux';
import Pagination from 'view/component/Pagination';
import { getCourseTypeAll, ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { ajaxSelectDivision, ajaxGetDivision, getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';


class CandidateModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = ({ _id, firstname = '', lastname = '', email = '', phoneNumber = '', onUpdated, courseType = '', state = '', division = '' }) => {
        this.onUpdated = onUpdated;
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemEmail.value(email);
        this.itemPhoneNumber.value(phoneNumber);
        ajaxGetCourseType(courseType, data => {
            this.setState({ courseTypeTitle: data.item.title });
            this.courseType.value(data && data.item ? { id: data.item._id, text: data.item.title } : null);
        });
        ajaxGetDivision(division, data =>
            this.division.value(data && data.item ? { id: data.item._id, text: data.item.title } : null));
        this.states.value(state);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            courseType: this.courseType.value(),
            division: this.division.value(),
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
        } else if (data.division == null) {
            T.notify('Cơ sở đào tạo không được trống', 'danger');
            this.division.focus();
        } else {
            this.props.update(this.state._id, data, (error) => {
                this.onUpdated && this.onUpdated(error);
                this.hide();
            });
        }
    }

    onUpStudent = (e) => {
        e.preventDefault();
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            courseType: this.courseType.value(),
            division: this.division.value(),
            state: this.states.value(),
            _id: this.state._id
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
        } else if (data.division == null) {
            T.notify('Cơ sở đào tạo không được trống', 'danger');
            this.division.focus();
        } else {
            this.props.upStudent(e, data, this.state.courseTypeTitle);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Đăng ký tư vấn',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.itemLastname = e} label='Họ' />
            <FormTextBox className='col-md-6' ref={e => this.itemFirstname = e} label='Tên' />
            <FormTextBox className='col-md-6' ref={e => this.itemEmail = e} type='email' label='Email' />
            <FormTextBox className='col-md-6' ref={e => this.itemPhoneNumber = e} type='phone' label='Số điện thoại' />
            <FormSelect className='col-md-6' ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} />
            <FormSelect className='col-md-6' ref={e => this.states = e} label='Trạng thái' data={this.props.states} />
            <FormSelect className='col-md-6' ref={e => this.division = e} label='Cơ sở đào t' data={ajaxSelectDivision} />
        </div>,
        buttons:
            this.props.permission.write &&
            <a className='btn btn-warning' href='#' onClick={e => this.onUpStudent(e)} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' />
            </a>
    });
}

const stateMapper = {
    MoiDangKy: { text: 'Mới đăng ký', style: { color: 'black' } },
    DangLienHe: { text: 'Đang liên hệ', style: { color: '#1488DB' } },
    Huy: { text: 'Huỷ', style: { color: '#DC3545' } },
    // UngVien: { text: 'Ứng viên', style: { color: '#28A745' } },
};
const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));

class CandidatePage extends AdminPage {
    state = { courseTypes: [] };
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCandidatePage();
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        this.props.getDivisionAll(list => {
            const division = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ division });
        });
        T.onSearch = (searchText) => this.props.getCandidatePage(1, 50, searchText);
    }

    edit = (e, item) => e.preventDefault() || this.candidateModal.show(item);

    updateCourseType = (item, courseType) => this.props.updateCandidate(item._id, { courseType });

    updateDivision = (item, division) => this.props.updateCandidate(item._id, { division });

    updateState = (item, state) => this.props.updateCandidate(item._id, { state });

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm =>
        isConfirm && this.props.deleteCandidate(item._id));

    upStudent = (e, item, courseTypeText) => e.preventDefault() || T.confirm('Trở thành ứng viên ', `Bạn có chắc muốn ${item.lastname + ' ' + item.firstname} trở thành ứng viên ${courseTypeText}?`, true, isConfirm =>
        isConfirm && this.props.updateCandidate(item._id, { state: 'UngVien' }));

    render() {
        const permission = this.getUserPermission('candidate', ['read', 'write', 'delete', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.candidate && this.props.candidate.page ?
            this.props.candidate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và tên</th>
                    <th style={{ width: '50%' }}>Thông tin liên hệ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nhân viên xử lý</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const selectedState = stateMapper[item.state],
                    dropdownState = <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.id)} textStyle={selectedState ? selectedState.style : null} />;
                const courseTypeText = item.courseType ? item.courseType.title : '',
                    dropdownCourseType = <Dropdown items={this.state.courseTypes} item={courseTypeText} onSelected={e => this.updateCourseType(item, e.id)} />;
                const divisionText = item.division ? item.division.title : '',
                    dropdownDivision = <Dropdown items={this.state.division} item={divisionText} onSelected={e => this.updateDivision(item, e.id)} />;
                const dates = <>
                    <p style={{ margin: 0 }}>{item.staff ? item.staff.lastname + ' ' + item.staff.firstname : 'Chưa xử lý!'}</p>
                    <p style={{ margin: 0 }} className='text-secondary'>{new Date(item.createdDate).getText()}</p>
                    {item.modifiedDate ? <p style={{ margin: 0 }} className='text-success'>{new Date(item.modifiedDate).getText()}</p> : null}
                </>;
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} />
                        <TableCell content={item.email + '\n' + item.phoneNumber} />
                        <TableCell content={dropdownDivision} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dropdownCourseType} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={item.state == 'UngVien' ? <span style={{ color: '#28A745' }}>Ứng viên</span> : dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dates} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}>
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
                <CandidateModal ref={e => this.candidateModal = e} update={this.props.updateCandidate} states={states} upStudent={this.upStudent} permission={permission} />
            </>,
            onExport: permission.export ? exportCandidateToExcel : null,
        });
    }
}
const mapStateToProps = state => ({ system: state.system, candidate: state.candidate });
const mapActionsToProps = { getCourseTypeAll, getCandidatePage, getCandidate, updateCandidate, deleteCandidate, getDivisionAll };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);