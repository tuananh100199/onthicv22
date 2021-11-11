import React from 'react';
import { connect } from 'react-redux';
import { getTimeTableByStudent } from './redux';
import { AdminPage, AdminModal, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
class NoteModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { note, truant } = item.data || { note: '', truant: false };
        this.setState({ note, truant });
    }

    render = () => {
        return this.renderModal({
            title: 'Ghi chú',
            body: <>
                <label className='col-md-12'>Nghỉ học: <b>{this.state.truant ? 'Có' : 'Không'}</b></label>
                <label className='col-md-12'>Ghi chú của giáo viên: <b>{this.state.note ? this.state.note : 'Chưa có!'}</b></label>
            </>,
        });
    }
}
class StudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/thoi-khoa-bieu'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getTimeTableByStudent(data => {
                    if (data.error) {
                        this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                    } else {
                        this.setState({ name: data.list && data.list[0] && data.list[0].student && data.list[0].student.course && data.list[0].student.course.name, listType: true, calendar: false });
                    }
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.calendar !== prevState.calendar) {
            const _this = this;
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
                select: (startDate, endDate) => {
                    this.onCalendarSelect(startDate.toDate(), endDate.toDate());
                },
                eventClick: function(calEvent) {
                    _this.eventSelect = calEvent;
                    _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                },
                aspectRatio: 3,
            });
        }
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
            color: '#1488DB',
        };
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getTimeTableByStudent(item => {
           done && done(item.list);
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

    render() {
        const { listType, calendar } = this.state;
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        let { list } = this.props.timeTable && this.props.timeTable.page ? this.props.timeTable.page : { list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: '35%', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: '35%', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: '30%', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nghỉ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ghi chú</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={<>{item.student && item.student.course ? item.student.course.name : ''} {item.student && item.student.courseType ? '(' + item.student.courseType.title + ')' : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.dateNumber} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.licensePlates} />
                    <TableCell type='text' style={{ textAlign: 'center', backgroundColor: item.truant ? 'red' : '', color: item.truant ? 'white' : '' }} content={item.truant ? 'X' : ''} />
                    <TableCell type='link' style={{ textAlign: 'center' }} content={<i className='fa fa-lg fa-comment' />} onClick={ e => this.edit(e, item) } />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name || '...'),
            breadcrumb: [<Link key={0} to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId}>Khóa học</Link>, 'Thời khóa biểu'],
            content: <>
                <div className='tile'>
                    <div className='pb-3' style={{marginBottom: '25px'}}>
                            <div style={{float: 'right', display: 'flex'}}>
                                <button style={{border: 'none', outline: 'none', marginRight: '3px', backgroundColor: listType ? '#2189CF' : ''}} onClick={() => this.setState({ calendar: false, listType: true }, () => this.forceUpdate)}><i className='fa fa-bars'></i> Danh sách</button>
                                <button style={{border: 'none', outline: 'none', backgroundColor: calendar ? '#2189CF' : ''}} onClick={() =>this.setState({ calendar: true, listType: false }, () => this.forceUpdate)}><i className='fa fa-calendar'></i> Lịch</button>
                            </div>
                        </div>
                    {listType ? table : null}
                    {calendar ? 
                        <div ref={e => this.calendar = e}></div>
                    : null} 
                </div>
                <NoteModal ref={e => this.modal = e} update={this.props.updateTimeTableByAdmin} />
            </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTableByStudent };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
