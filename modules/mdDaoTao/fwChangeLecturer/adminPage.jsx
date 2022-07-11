import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectLecturer } from 'modules/_default/fwUser/redux';
import { getChangeLecturerPage, deleteChangeLecturer, updateChangeLecturer } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormSelect, FormDatePicker, FormRichTextBox } from 'view/component/AdminPage';

const ChangeLecturerStates = [
    { id: 'approved', text: 'Đã duyệt', color: '#1488db', className: 'btn btn-primary', icon: 'fa fa-lg fa-check' },
    { id: 'waiting', text: 'Đang chờ duyệt', color: '#ffc107', className: 'btn btn-warning', icon: 'fa fa-lg fa-clock-o' },
    { id: 'reject', text: 'Từ chối', color: 'black', className: 'btn btn-danger', icon: 'fa fa-lg fa-times' },
];
const ChangeLecturerStatesMapper = {};
ChangeLecturerStates.forEach(({ id, text, color }) => ChangeLecturerStatesMapper[id] = { text, color });

class ChangeLecturerModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemReason.focus()));
    }

    onShow = (item) => {
        let { _id, student, requestedLecturer, lecturer, startDate, reason, state } = item || { _id: null, student: null, lecturer: null, startDate: '', reason: '', state: 'waiting' };
        this.itemStudent.value(student ? student.lastname + ' ' + student.firstname : '');
        this.itemRequestedLecturer.value(requestedLecturer ? requestedLecturer.lastname +' '+ requestedLecturer.firstname + (requestedLecturer.identityCard ? '(' + requestedLecturer.identityCard +')' : ''): 'Chưa có');
        this.itemStartDate.value(startDate);
        this.itemReason.value(reason);
        this.itemState.value(state);
        this.setState({ _id, divisionId: student.division }, () => { this.itemLecturer.value(lecturer ? { id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname } : null); });
    };

    onSubmit = () => {
        const data = { 
            lecturer: this.itemLecturer.value(),
            startDate: this.itemStartDate.value(),
            reason: this.itemReason.value(),
            state: this.itemState.value()
        };
        if (data.startDate == '') {
            T.notify('Ngày đổi bị trống!', 'danger');
            this.itemStartDate.focus();
        } else if (data.reason == '') {
            T.notify('Lý do đổi bị trống!', 'danger');
            this.itemReason.focus();
        } else {
            this.props.update(this.state._id, data, () => this.hide());
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thay đổi giáo viên',
            size: 'large',
            body:
                <>
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.itemStudent = e} label='Học viên' readOnly={true} />
                    <FormTextBox className='col-md-6' ref={e => this.itemRequestedLecturer = e} label='Giáo viên học viên yêu cầu' readOnly={true} />
                    <FormSelect className='col-md-4' ref={e => this.itemLecturer = e} label='Giáo viên thay đổi' data={ajaxSelectLecturer(this.state.divisionId)} readOnly={readOnly} />
                    <FormDatePicker className='col-md-4' ref={e => this.itemStartDate = e} label='Ngày bắt đầu đổi' readOnly={readOnly}/>
                    <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={ChangeLecturerStates} readOnly={readOnly} /> 
                    <FormRichTextBox className='col-md-12' ref={e => this.itemReason = e} label='Lý do' readOnly={readOnly} />
                </div>
                </>
        });
    }
}

class ChangeLecturerPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/change-lecturer', () => {
            this.props.getChangeLecturerPage(1, 50, {});
        });
    }
    edit = (e, item) => {
        e.preventDefault();
        this.modal.show(item);
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thay đổi giáo viên', 'Bạn có chắc muốn xoá thay đổi giáo viên này?', true, isConfirm =>
        isConfirm && this.props.deleteChangeLecturer(item._id));

    render() {
        const permission = this.getUserPermission('changeLecturer');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.changeLecturer && this.props.changeLecturer.page ?
            this.props.changeLecturer.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%' }} nowrap='true'>Học viên yêu cầu</th>
                    <th style={{ width: '20%' }} nowrap='true'>Giáo viên học viên yêu cầu</th>
                    <th style={{ width: '20%' }} nowrap='true'>Giáo viên được thay đổi</th>
                    <th style={{ width: '60%' }} nowrap='true'>Lý do</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày tạo</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày bắt đầu</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.student && item.student.lastname} ${item.student && item.student.firstname}`} />
                    <TableCell type='text' content={item.requestedLecturer ? item.requestedLecturer.lastname + ' ' + item.requestedLecturer.firstname + (item.requestedLecturer.identityCard ? '(' + item.requestedLecturer.identityCard +')' : '') : 'Chưa có'} />
                    <TableCell type='text' content={item.lecturer ? item.lecturer.lastname + ' ' + item.lecturer.firstname : 'Chưa có'} />
                    <TableCell type='text' content={item.reason} />
                    <TableCell type='date' content={new Date(item.createdDate).getShortText()} />
                    <TableCell type='date' content={new Date(item.startDate).getShortText()} />
                    <TableCell type='text' content={ChangeLecturerStatesMapper[item.state] && ChangeLecturerStatesMapper[item.state].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: ChangeLecturerStatesMapper[item.state] && ChangeLecturerStatesMapper[item.state].color }}  nowrap='true'/>
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-refresh',
            title: 'Thay đổi giáo viên',
            breadcrumb: ['Thay đổi giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.props.getChangeLecturerPage} />
                    <ChangeLecturerModal ref={e => this.modal = e} update={this.props.updateChangeLecturer} readOnly={!permission.write} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, changeLecturer: state.trainning.changeLecturer });
const mapActionsToProps = { getChangeLecturerPage, deleteChangeLecturer, updateChangeLecturer };
export default connect(mapStateToProps, mapActionsToProps)(ChangeLecturerPage);