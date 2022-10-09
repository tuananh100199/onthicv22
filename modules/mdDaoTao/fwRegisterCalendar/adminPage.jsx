import React from 'react';
import { connect } from 'react-redux';
import { getRegisterCalendarPage,createRegisterCalendar,updateRegisterCalendar,deleteRegisterCalendar } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell,FormSelect,FormDatePicker,FormTextBox,AdminModal } from 'view/component/AdminPage';
import { RegisterCalendarStatesMapper, timeOffStatesMapper } from './index';
import {ajaxSelectTeacher} from 'modules/_default/fwUser/redux';
import Dropdown from 'view/component/Dropdown';

const stateMapper = {
    approved: { text: 'Đã duyệt', style: { color: '#1488db' } },
    waiting: { text: 'Đang chờ duyệt', style: { color: '#ffc107' } },
    reject: { text: 'Từ chối', style: { color: '#F80000' } },
    cancel: { text: 'Hủy', style: { color: '#6C757D' } },
};

const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));


const timeOffValues = [
    {id:'morning',text:'Buổi sáng'},
    {id:'noon',text:'Buổi chiều'},
    {id:'allDay',text:'Cả ngày'},
];

const stateValues = [
    {id:'approved',text:'Đã duyệt'},
    {id:'waiting',text:'Đang chờ duyệt'},
    {id:'reject',text:'Từ chối'},
    {id:'cancel',text:'Hủy'},
];

const dataThongKe = [
    {   id: 'all', text: 'Tất cả'    },
    {   id: 'year', text: 'Lọc theo năm'    },
    {   id: 'month', text: 'Lọc theo tháng'  },
];

class RegisterCalendarModal extends AdminModal {

    onShow = (item) => {
        const { _id=null, lecturer=null, dateOff='',timeOff='',state='approved' } = item || {};
        this.itemLecturer.value(lecturer?{id:lecturer._id,text:`${lecturer.lastname} ${lecturer.firstname} (${lecturer.identityCard})`}:'');
        this.itemDateOff.value(dateOff);
        this.itemTimeOff.value(timeOff);
        this.itemState.value(state);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            lecturer:this.itemLecturer.value(),
            dateOff:this.itemDateOff.value(),
            timeOff:this.itemTimeOff.value(),
            state:this.itemState.value(),
        };

        if (!data.lecturer) {
            T.notify('Giáo viên bị trống!', 'danger');
            this.itemDateOff.focus();
        }else if (!data.timeOff) {
            T.notify('Ngày nghỉ bị trống!', 'danger');
            this.itemTimeOff.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }
    render = () => this.renderModal({
        title: 'Lịch nghỉ giáo viên',
        body: <>
            <FormSelect ref={e=>this.itemLecturer=e} data={ajaxSelectTeacher} label = 'Giáo viên'readOnly={this.props.readOnly}/>
            <FormDatePicker ref={e => this.itemDateOff = e} label='Ngày nghỉ'type='date-mask' readOnly={this.props.readOnly}/>
            <FormSelect ref={e => this.itemTimeOff = e} label='Buổi nghỉ' data={timeOffValues} readOnly={this.props.readOnly}/>
            <FormSelect ref={e => this.itemState = e} label='Trạng thái' data={stateValues} readOnly={this.props.readOnly}/>
        </>
    });
}
class TimeTablePage extends AdminPage {
    state = { searchText: '', isSearching: false };
    componentDidMount() {
        T.ready(()=>{
            this.props.getRegisterCalendarPage(1, 50, {},{},{});
        });
        this.type && this.type.value('all');
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getRegisterCalendarPage(undefined, undefined, searchText ? { searchText: searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch nghỉ', 'Bạn có chắc muốn xoá lịch nghỉ của giáo viên này?', true, isConfirm =>
        isConfirm && this.props.deleteRegisterCalendar(item._id));

    onChangeType=(filterTimeValue)=>{
        this.setState({filterTimeValue});
        if(filterTimeValue=='all'){
            this.props.getRegisterCalendarPage(1,null,{});
        }
    }

    handleFilterTime = ()=>{
        let dateStart,dateEnd;
        if(this.state.filterTimeValue){
            if(this.state.filterTimeValue=='year'){
                dateStart=this.yearStart.value();
                dateEnd=this.yearEnd.value();
            }else{
                dateStart=this.monthStart.value();
                dateEnd=this.monthEnd.value();
            }
            if (dateStart > dateEnd) {
                T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
            }else{
                const condition = {
                    dateOff:{dateStart,dateEnd,type:this.state.filterTimeValue}
                };
                this.props.getRegisterCalendarPage(1,null,condition);
            }
        }
    }

    updateState = (item, state) =>{
        this.props.updateRegisterCalendar(item._id, { state });
    }

    renderDropdownState = (item)=>{
        const selectedState = stateMapper[item.state];
        return <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.id)} textStyle={selectedState ? selectedState.style : null} />;
    }

    render() {
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const permission = this.getUserPermission('registerCalendar');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.registerCalendar && this.props.registerCalendar.page ?
            this.props.registerCalendar.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
            const table = renderTable({
            getDataSource: () => list,
            autoDisplay:true,stickyHead:true,
            renderHead: () => (
                <TableHead getPage = {this.props.getRegisterCalendarPage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell style={{ width: '100%' }} menuStyle={{width:200}} nowrap='true' name='lecturer' filter='select' filterData={ajaxSelectTeacher}>Giáo viên</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Số điện thoại</TableHeadCell>
                    <TableHeadCell name = 'dateOff' sort={true} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày nghỉ</TableHeadCell>
                    <TableHeadCell name = 'timeOff' filter='select' filterData={timeOffValues} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi nghỉ</TableHeadCell>
                    <TableHeadCell name='state' filter = 'select' filterData={stateValues} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) =>{
                return (
                    <tr key={index} style={{ backgroundColor: T.dateToText(item.dateOff, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={<>{item.lecturer ? item.lecturer.lastname + ' ' + item.lecturer.firstname : ''}<br />{item.lecturer ? item.lecturer.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.lecturer ? item.lecturer.identityCard : ''} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                        <TableCell type='text' content={item.lecturer && item.lecturer.phoneNumber ? T.mobileDisplay(item.lecturer.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.dateOff ? T.dateToText(item.dateOff, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' content={timeOffStatesMapper[item.timeOff] && timeOffStatesMapper[item.timeOff].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: timeOffStatesMapper[item.timeOff] && timeOffStatesMapper[item.timeOff].color }}  nowrap='true'/>
                        <TableCell type='text' content={permission.write?this.renderDropdownState(item):RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/>
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                    </tr>);
            } ,
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Lịch nghỉ giáo viên',
            breadcrumb: ['Lịch nghỉ giáo viên'],
            content: <>
                <div className='tile'>
                <div className='row'>
                    <div className='col-auto'>
                        <label className='col-form-label'>Lọc theo thời gian: </label>
                    </div>
                    <FormSelect ref={e => this.type = e} data={dataThongKe} placeholder='Lọc theo thời gian'
                        onChange={data => this.onChangeType(data.id)} style={{ margin: 0, width: '200px' }} />
                </div>
                    {this.state.filterTimeValue && this.state.filterTimeValue!='all' && <h3 className='tile-title pt-3'>{this.state.filterTimeValue=='year'?dataThongKe[1].text:dataThongKe[2].text}</h3>}
                    <div className='tile-body row'>

                        {(this.type && this.type.value() =='month') ? (
                        <>
                            <FormDatePicker ref={e => this.monthStart = e} label={'Thời gian bắt đầu (mm/yyyy)'} className='col-md-5' type={'month-mask'} />
                            <FormDatePicker ref={e => this.monthEnd = e} label={'Thời gian kết thúc (mm/yyyy)'} className='col-md-5' type={'month-mask'} />
                        </>
                        ) : null}

                        {(this.type && this.type.value() =='year') ? (
                        <>
                            <FormTextBox ref={e => this.yearStart = e} label={'Năm bắt đầu'} className='col-md-5' type={'number'} />
                            <FormTextBox ref={e => this.yearEnd = e} label={'Năm kết thúc'} className='col-md-5' type={'number'} />
                        </>
                        ) : null}
                        {this.state.filterTimeValue && this.state.filterTimeValue!='all' &&(<div className='m-auto col-md-2'>
                            <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterTime}>
                                <i className='fa fa-filter' /> Lọc
                            </button>
                        </div>)}
                    </div>
                        {/* {(this.type && this.type.value() =='year') ? (
                        <div className='tile-body row'>
                            <FormTextBox ref={e => this.yearStart = e} label={'Năm bắt đầu (mm/yyyy)'} className='col-md-5' type='number' />
                            <FormTextBox ref={e => this.yearEnd = e} label={'Năm kết thúc (mm/yyyy)'} className='col-md-5' type='number' />
                            <div className='m-auto col-md-2'>
                                <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilter}>
                                    <i className='fa fa-filter' /> Lọc
                                </button>
                            </div>
                        </div>) : null}     */}
                    {table}
                    
                </div>
                <RegisterCalendarModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createRegisterCalendar} update={this.props.updateRegisterCalendar} />
                <Pagination name='pageRegisterCalendar' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getRegisterCalendarPage} />
            </>,
            onCreate:permission.write?this.edit:null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, registerCalendar: state.trainning.registerCalendar });
const mapActionsToProps = { getRegisterCalendarPage,createRegisterCalendar,updateRegisterCalendar,deleteRegisterCalendar };
export default connect(mapStateToProps, mapActionsToProps)(TimeTablePage);
