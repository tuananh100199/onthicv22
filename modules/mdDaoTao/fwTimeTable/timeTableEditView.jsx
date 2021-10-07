import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage, updateTimeTableByLecturer } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';


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

class TimeTableModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, dateNumber, date, startHour, numOfHours, truant, licensePlates, content, note } = item || { date: new Date(), startHour: 8, numOfHours: 2, truant: false, licensePlates: '', content: '', note: '' },
            endHour = startHour + numOfHours;
        this.itemDate.value(date);
        this.itemStartHour.value(startHour);
        this.itemNumOfHours.value(numOfHours);
        this.itemLicensePlates.value(licensePlates);
        this.itemTruant.value(truant);
        this.itemContent.value(content);
        this.itemNote.value(note);

        this.setState({ loading: false, _id, student, courseType: null, dateNumber, date, endHour });
    }

    onSubmit = () => {
        const { _id, student } = this.state;
        if (student) {
            const data = {
                date: this.itemDate.value(),
                startHour: this.itemStartHour.value(),
                numOfHours: this.itemNumOfHours.value(),
                truant: this.itemTruant.value(),
                licensePlates: this.itemLicensePlates.value(),
                content: this.itemContent.value(),
                note: this.itemNote.value(),
            };
            if (data.date == null) {
                T.notify('Ngày học chưa được chọn!', 'danger');
                this.itemDate.focus();
            } else if (data.startHour == null) {
                T.notify('Giờ bắt đầu chưa được chọn!', 'danger');
                this.itemStartHour.focus();
            } else if (data.numOfHours == null) {
                T.notify('Số giờ học chưa được chọn!', 'danger');
                this.itemNumOfHours.focus();
            } else if (data.licensePlates == null) {
                T.notify('Xe học chưa được chọn!', 'danger');
                this.itemLicensePlates.focus();
            } else {
                data.date = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate());
                _id ? this.props.update(_id, data, () => this.hide()) : this.props.create(data, () => this.hide());
            }
        }
    }

    onSelectDate = (date) => this.setState({ date }, () => this.getDateNumber() || this.itemStartHour.focus());

    onChangeHour = () => {
        let startHour = this.itemStartHour.value(),
            numOfHours = this.itemNumOfHours.value();
        if (startHour && numOfHours) {
            startHour = Number(startHour);
            numOfHours = Number(numOfHours);
            if (startHour < 0) {
                this.itemStartHour.value(0);
            } else if (startHour > 23) {
                this.itemStartHour.value = startHour % 100 <= 23 ? startHour % 100 : startHour % 10;
            } else if (numOfHours < 1) {
                this.itemNumOfHours.value(1);
            } else if (numOfHours > 23) {
                this.itemNumOfHours.value = numOfHours % 100 <= 23 ? numOfHours % 100 : numOfHours % 10;
            } else {
                this.getDateNumber();
                this.setState({ endHour: startHour + numOfHours });
            }
        } else {
            this.setState({ endHour: null, dateNumber: null });
        }
    }

    getDateNumber = () => {
        const { student, date } = this.state,
            startHour = this.itemStartHour.value();
        if (student && date && startHour != null) {
            this.props.getDateNumber(student._id, new Date(date.getFullYear(), date.getMonth(), date.getDate()), startHour, (dateNumber) => this.setState({ dateNumber }));
        }
    }

    render = () => {
        const { date, dateNumber, endHour, student } = this.state;
        return this.renderModal({
            title: 'Buổi học thực hành',
            size: 'large',
            body: <>
                <div className='row' style={{ display: student ? 'flex' : 'none' }}>
                    <p className='col-lg-3'>Học viên: <b>{student && student.lastname + ' ' + student && student.firstname}</b>. Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    <p className='col-lg-6'>Khóa học: <b>{student && student.course ? student.course.name : ''}</b>. Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    <p className='col-lg-3'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p>

                    <FormDatePicker className='col-12 col-md-4' ref={e => this.itemDate = e} label='Ngày học' onChange={this.onSelectDate} readOnly={this.props.readOnly} />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemStartHour = e} label='Giờ bắt đầu' type='number' min='0' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemNumOfHours = e} label='Số giờ học' type='number' min='1' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} />
                    <p className='col-12' style={{ visibility: date ? 'visible' : 'hidden' }}>
                        {date == null ? '' : <>
                            Học <span className='text-success'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span>
                            {endHour ? <> từ <span className='text-success'> {this.itemStartHour.value()}h - {endHour}h</span></> : ''}. </>}
                        {dateNumber == null ? '' :
                            (dateNumber == -1 ? <span className='text-danger'>Trùng thời khóa biểu!</span> : <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>)}
                    </p>

                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Xe học' className='col-md-4' style={{ textTransform: 'uppercase' }} readOnly={this.props.readOnly} />
                    <FormCheckbox ref={e => this.itemTruant = e} label='Học viên vắng học' className='col-md-8' readOnly={this.props.readOnly} />

                    <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung học' className='col-lg-6' readOnly={this.props.readOnly} />
                    <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' className='col-lg-6' readOnly={this.props.readOnly} />
                </div>
            </>,
        });
    }
}

class StudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const params = T.routeMatcher('/user/course/:courseId/student/:studentId/time-table').parse(window.location.pathname),
        courseId = params.courseId,
        studentId = params.studentId;
        const currentUser = this.props.system ? this.props.system.user : null,
        { isLecturer, isCourseAdmin } = currentUser;
        this.setState({isLecturer: isLecturer, isCourseAdmin: isCourseAdmin, courseId: courseId, studentId: studentId});

        if (studentId) {
            this.setState({ courseId: courseId });
            T.ready('/user/course/' + courseId, () => {
                studentId && this.props.getTimeTablePage(1, 50, {student: studentId});
            });
        } else {
            this.props.history.push(`/user/course/${this.state.courseId}`);
        }
    }

    edit = (e, item) =>{
        e.preventDefault();
        if (this.state.isLecturer){
            this.modalLecturer.show(item);
        } else if(this.state.isCourseAdmin) {
            this.modalCourseAdmin.show(item);
        }
    } 
   
    render() {
        const backRoute = '/user/course/' + this.state.courseId;
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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
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
            icon: 'fa fa-cubes',
            title: 'Khóa học: Thời khóa biểu học viên',
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học</Link>, 'Thời khóa biểu'],
            backRoute: backRoute,
            content: <>
                <div className='tile'>{table}</div>
                <NoteModal ref={e => this.modalLecturer = e} readOnly={!permission.write}
                update={this.props.updateTimeTableByLecturer} />
                <TimeTableModal ref={e => this.modalCourseAdmin = e} readOnly={!permission.write}
                    getStudent={this.props.getStudent} create={this.props.createTimeTable} update={this.props.updateTimeTable} getDateNumber={this.props.getTimeTableDateNumber} />
            
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage, updateTimeTableByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
