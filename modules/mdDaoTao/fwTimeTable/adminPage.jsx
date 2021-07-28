import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage, createTimeTable, updateTimeTable, deleteTimeTable, getTimeTableDateNumber } from './redux';
import { ajaxSelectCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { ajaxSelectStudentByCourse, getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormSelect, FormTextBox, FormCheckbox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';

class TimeTableModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, dateNumber, date, startHour, numOfHours, truant, licensePlates, content, note } = item || { date: new Date(), startHour: 8, numOfHours: 2, truant: false, licensePlates: '', content: '', note: '' },
            endHour = startHour + numOfHours;
        this.itemStudent.value(student ? student._id : null);
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
                student: student ? student._id : null,
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

    onChangeCourse = (data) => data && data.id && this.setState({ courseType: data.id }, () =>
        this.itemStudent.value(null));
    onChangeStudent = (data) => data && data.id && this.setState({ loading: true }, () => this.props.getStudent(data.id, student => {
        this.setState({ loading: false, student }, () => this.state._id || this.getDateNumber());
    }));

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
        const { loading, courseType, date, dateNumber, endHour, student } = this.state;
        return this.renderModal({
            title: 'Buổi học thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.itemCourse = e} label='Khóa học' data={ajaxSelectCourse} onChange={this.onChangeCourse} className='col-lg-4' readOnly={this.props.readOnly} allowClear={true} />
                    <FormSelect ref={e => this.itemStudent = e} label='Học viên' data={ajaxSelectStudentByCourse(courseType)} onChange={this.onChangeStudent} className='col-lg-8' readOnly={this.props.readOnly} />
                    {loading ? <p className='col-12'>Đang tải...</p> : ''}
                </div>
                <div className='row' style={{ display: student ? 'flex' : 'none' }}>
                    <p className='col-lg-7'>Khóa học: <b>{student && student.course ? student.course.name : ''}</b>. Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    <p className='col-lg-5'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p>

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

class TimeTablePage extends AdminPage {
    state = { searchText: '', isSearching: false };
    componentDidMount() {
        this.props.getTimeTablePage(1, 50, undefined);
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getTimeTablePage(undefined, undefined, searchText ? { searchText: searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thời khóa biểu', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm =>
        isConfirm && this.props.deleteTimeTable(item._id));

    render() {
        const permission = this.getUserPermission('timeTable', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
            this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.student && item.student.user && item.student.user.phoneNumber ? T.mobileDisplay(item.student.user.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<><span className='text-primary'>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' content={item.numOfHours} />
                    <TableCell type='number' content={item.licensePlates} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Thời khóa biểu',
            breadcrumb: ['Thời khóa biểu'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminTimeTable' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTimeTablePage} />
                <TimeTableModal ref={e => this.modal = e} readOnly={!permission.write}
                    getStudent={this.props.getStudent} create={this.props.createTimeTable} update={this.props.updateTimeTable} getDateNumber={this.props.getTimeTableDateNumber} />
            </>,
            onCreate: permission.write ? this.edit : null,
            onDelete: permission.delete ? this.delete : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage, createTimeTable, updateTimeTable, deleteTimeTable, getStudent, getTimeTableDateNumber };
export default connect(mapStateToProps, mapActionsToProps)(TimeTablePage);
