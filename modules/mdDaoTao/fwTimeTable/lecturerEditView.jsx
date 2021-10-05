import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage, updateTimeTableByLecturer } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';

class NoteModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, note, truant } = item || { note: '', truant: false };
        this.itemNote.value(note);
        this.itemTruant.value(truant);

        this.setState({ loading: false, _id, student});
    }

    onSubmit = () => {
        const { _id, student } = this.state;
        if (student) {
            const changes = {
                note: this.itemNote.value(),
                truant: this.itemTruant.value(),
            };
        this.props.update(_id, changes, student._id , () => this.hide()); 
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Ghi chú',
            body: <>
                <FormCheckbox ref={e => this.itemTruant = e} label='Học viên nghỉ học' isSwitch={true} readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' readOnly={this.props.readOnly} />
            </>,
        });
    }
}

class StudentView extends AdminPage {
    componentDidMount() {
        const params = T.routeMatcher('/user/lecturer/student-time-table/:_id').parse(window.location.pathname),
            studentId = params._id;
        this.setState({studentId: studentId});
        studentId && this.props.getTimeTablePage(1, 50, {student: studentId});
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
   
    render() {
        const backRoute = '/user/lecturer/student-time-table';
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, list } = this.props.timeTable && this.props.timeTable.page ?
            this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nghỉ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ghi chú</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student && item.student.user && item.student.user.phoneNumber ? T.mobileDisplay(item.student.user.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                    <TableCell type='number' content={item.licensePlates} />
                    <TableCell type='checkbox' content={item.truant} permission={permission} onChanged={active => this.props.updateTimeTableByLecturer(item._id, { truant: active }, this.state.studentId)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu chi tiết',
            breadcrumb: [<Link key={0} to={backRoute}>Học viên</Link>, 'Thời khóa biểu chi tiết'],
            backRoute: backRoute,
            content: <>
                <div className='tile'>{table}</div>
                <NoteModal ref={e => this.modal = e} readOnly={!permission.write}
                update={this.props.updateTimeTableByLecturer} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage, updateTimeTableByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
