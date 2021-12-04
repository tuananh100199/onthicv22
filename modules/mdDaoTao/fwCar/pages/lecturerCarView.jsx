import React from 'react';
import { connect } from 'react-redux';
import { getTimeTableCar, getTimeTableCarPage, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber } from 'modules/mdDaoTao/fwTimeTable/redux';
import { getCarOfLecturer } from '../redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormRichTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { RegisterCalendarStates, RegisterCalendarStatesMapper } from 'modules/mdDaoTao/fwRegisterCalendar/index';

class TimeTableCarModal extends AdminModal {
    state = {listTimeTable: null};

    componentDidMount() {
        this.props.getCarOfLecturer({ user: this.props.lecturerId }, car => {
            if (car) {
                this.setState({ car });
            }
        });
    }

    onShow = (item) => {
        function formatDayOrMonth(item){
            return ('0' + item).slice(-2);
        }

        function formatDate(item) {
            let date = new Date(item);
            const year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();

            return `${year}-${formatDayOrMonth(month)}-${formatDayOrMonth(day)}T00:00:00.000Z`;// chuyển ngày trong calendar sang định dạng lưu trong DB
        }

        const { _id, student, dateNumber, date, startHour, numOfHours, state, truant, car, content, note } = item.data || { date: item.start ? item.start.toISOString() : null, startHour: 8, numOfHours: 2, state: 'waiting', truant: false, car: this.props.car ? this.props.car : '', content: '', note: '' },
            endHour = startHour + numOfHours;
        this.itemStudent.value(student ? student.lastname + ' ' + student.firstname : null);
        this.itemDate.value(date);
        this.itemStartHour.value(startHour);
        this.itemNumOfHours.value(numOfHours);
        this.itemCar.value(car && car.licensePlates);
        this.itemTruant.value(truant);
        this.itemContent.value(content);
        this.itemNote.value(note);
        this.itemState && this.itemState.value(state);

        this.setState({ loading: false, _id, student, dateNumber, date, startHour, endHour });
        date ? this.props.getTimeTableCar({ carId: car._id, date: formatDate(date), official: this.props.official }, data => {
            if (data.items && data.items.length){
                this.setState({ listTimeTable: data.items });
            } else {
                this.setState({ listTimeTable: null });
            }
        }) : null;
    }

    delete = () => T.confirm('Xóa thời khóa biểu', 'Bạn có chắc chắn xóa thời khóa biểu này?', isConfirm => {
        isConfirm && this.props.delete(this.state._id);
        this.hide();
    })

    render = () => {
        const { loading, date, dateNumber, student, listTimeTable } = this.state;
        const table = renderTable({
            getDataSource: () => listTimeTable,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '30%' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.student ? item.student.lastname + ' ' + item.student.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student ? item.student.identityCard : ''}  />
                    <TableCell type='text' content={ item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                </tr>
            ),
        });
        return this.renderModal({
            title: 'Buổi học thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormTextBox ref={e => this.itemStudent = e} label='Học viên' className='col-lg-6' readOnly={true} />
                    {student ? <p className='col-lg-5'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p> : null}
                    {loading ? <p className='col-12'>Đang tải...</p> : ''}
                </div>
                <div className='row' style={{ display: student ? 'flex' : 'none' }}>
                    <FormDatePicker className='col-12 col-md-4' ref={e => this.itemDate = e} label='Ngày học' onChange={this.onSelectDate} readOnly={true} type='date-mask' required />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemStartHour = e} label='Giờ bắt đầu' type='number' min='0' max='23' onChange={this.onChangeHour} readOnly={true} required />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemNumOfHours = e} label='Số giờ học' type='number' min='1' max='23' onChange={this.onChangeHour} readOnly={true} required />
                    
                    <p className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : ''}</b>. Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    <p className='col-md-6'> {dateNumber == null ? '' :
                        (dateNumber == -1 ? <span className='text-danger'>Trùng thời khóa biểu!</span> : <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>)}
                    </p>
                    {listTimeTable && listTimeTable.length && date != null ? 
                    <div className='col-md-12'>
                        <p>
                            Lịch dạy ngày <span className='text-success'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span><span> của giáo viên <b>{this.props.lecturerName ? this.props.lecturerName : ''}</b></span>
                        </p>
                        {table}
                    </div> : ''}

                    <FormTextBox ref={e => this.itemCar = e} label='Xe học' className='col-md-4' style={{ textTransform: 'uppercase' }} readOnly={true} />
                    <FormCheckbox ref={e => this.itemTruant = e} label='Học viên vắng học' className='col-md-4' readOnly={true} />
                    <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={RegisterCalendarStates} readOnly={true} /> 

                    <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung học' className='col-lg-6' readOnly={true} />
                    <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' className='col-lg-6' readOnly={true} />
                </div>
            </>,
        });
    }
}

class LecturerCarView extends AdminPage {
    state = {};
    eventSelect = null;
    componentDidMount() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user;

        const { car } = this.props;

        if (car) {
            this.setState({ isLecturer, isCourseAdmin });
            this.getTimeTablePage(undefined, undefined);
        }

        const _this = this;
        T.ready('/user/car', () => {
          $(this.calendar).fullCalendar({
                timeZone: 'UTC', timeFormat: 'DD-HH:mm', dayHeaderFormat: 'dd/mm',
                // weekNumbers: true,
                selectable: true, eventLimit: false,
                displayEventTime: true, slotEventOverlap: false, navLinks: true,
                weekNumberCalculation: 'ISO',
                fixedWeekCount: false, displayEventEnd: true,
                showNonCurrentDates: false,
                monthNames: ['Tháng Một','Tháng Hai','Tháng Ba','Tháng Bốn','Tháng Năm','Tháng Sáu','Tháng Bảy','Tháng Tám','Tháng Chín','Tháng Mười','Tháng Mười Một','Tháng Mười Hai'],
                monthNamesShort: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
                dayNames: ['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy','Chủ Nhật'],
                dayNamesShort: ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'],
                header: {
                    left: 'prev,next',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                views: {
                    month: { timeFormat: 'H:mm' },
                    agendaWeek: { columnHeaderFormat: 'ddd DD/MM' }
                },
                events: function(start, end, timezone, callback) {
                    _this.getData(items => {
                        callback(items.map(item => _this.getEventObject({}, item)));
                    });
                    },
                // select: (startDate, endDate) => {
                //     this.onCalendarSelect(startDate.toDate(), endDate.toDate());
                // },
                eventClick: function(calEvent) {
                    _this.eventSelect = calEvent;
                    _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                },
                aspectRatio:  isLecturer ? 3 : 2,
            });
        });
    }

    getEventObject = (currentEnvent = {}, newItem) => {
        function formatTime(item){
            return ('0' + item).slice(-2);
        }
        let date = new Date(newItem.date);
        const year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate();
        
        const newEvent = {
        ...currentEnvent,
        title: `${newItem.student ? newItem.student.lastname + ' ' + newItem.student.firstname : ''}`,
        start: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour)}:00:00`,
        end: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour + newItem.numOfHours)}:00:00`,
        item: newItem,
        color: RegisterCalendarStatesMapper[newItem.state] && RegisterCalendarStatesMapper[newItem.state].color,
    };
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getTimeTableCar({ carId: this.props.car && this.props.car._id, official: this.props.official }, data => {
           done && done(data.items);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, data: item };
        this.modal.show(data);
    }

    edit = (e, item) => {
        const data = {data: item };
        e.preventDefault();
        this.modal.show(data);
    }

    getPage = (pageNumber, pageSize) => this.getTimeTablePage(pageNumber, pageSize);

    getTimeTablePage = (pageNumber, pageSize) => {
        this.props.getTimeTableCarPage(pageNumber, pageSize, { carId: this.props.car && this.props.car._id, filterOn: this.props.filterOn, official: this.props.official });
    }

    render() {
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
        this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
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
            renderRow: (item, index) =>  (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.student && item.student.user && item.student.user.phoneNumber ? T.mobileDisplay(item.student.user.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                    <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.car && item.car.licensePlates} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });

        return (<>
                <div>
                    {this.props.list ? table : null}
                    {this.props.calendar ? 
                    <div ref={e => this.calendar = e}></div>
                    : null} 
                </div>
                <TimeTableCarModal ref={e => this.modal = e} readOnly={!permission.write} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                    create={this.props.createTimeTableByAdmin} update={this.props.updateTimeTableByAdmin} delete={this.deleteCalendar} getDateNumber={this.props.getTimeTableDateNumber} getPage={this.props.getTimeTableCarPage} getTimeTableCar={this.props.getTimeTableCar} onSave={this.onModalFormSave} getCarOfLecturer={this.props.getCarOfLecturer}  /> 
                 <Pagination name='pageTimeTableCar' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.getPage} />
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTableCarPage, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber, getTimeTableCar, getCarOfLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerCarView);