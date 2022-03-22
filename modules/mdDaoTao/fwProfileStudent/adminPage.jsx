import React from 'react';
import { connect } from 'react-redux';
import { getProfileStudentPage,updateProfileStudent } from './redux';
import { AdminPage, renderTable, TableCell,FormSelect,TableHeadCell,TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';

const filterCondition = [
    {id:'1',text:'Hoàn tất'},
    {id:'0',text:'Chưa hoàn tất'},
];
class ProfileStudentPage extends AdminPage {
    state = {defaultFilterValue:'all',filterCondition:{},searchText:'',isExpandFilter:true};
    componentDidMount() {
        T.ready('/user/profile-student', () => {
            T.showSearchBox(() => {this.setState({filterCondition:{}});});
            T.onSearch = (searchText) => this.onSearch({searchText},()=>this.setState({searchText}));
            
            this.props.getCourseTypeAll(data => {
                const courseTypes = [{id:0,text:'Tất cả'}];
                data.length && data.forEach(item => {
                    courseTypes.push({ id: item._id, text: item.title });
                });
                this.setState({courseTypes},()=>{
                    this.courseType.value(0);
                });
            });
            this.onSearch({});
        });
    }

    onSearch = ({pageNumber,pageSize,searchText=this.state.searchText,filterCondition=this.state.filterCondition,courseType = this.courseType.value()},done)=>{        
        // const courseType = this.state.courseTypeId;
        const condition = courseType == '0' ? { searchText,filterCondition } : {filterCondition, searchText, courseType };
        this.props.getProfileStudentPage(pageNumber, pageSize, condition, () => {
            done && done();
        });
    }
    
    update = (_id,change)=>{
        this.props.updateProfileStudent(_id,change,()=>{
            this.onSearch({});
        });
    };

    handleChangeFilter = (filterCondition)=>{
        this.onSearch({filterCondition},()=>this.setState({filterCondition}));
    }

    onChangeCourseType = (courseType) => {
        this.setState({ courseTypeId: courseType });
        this.course.value({ id: 0, text: 'Tất cả khóa học' });
        // this.onSearch({ courseType });
    }

    render() {
        const permission = this.getUserPermission('profileStudent');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.profileStudent && this.props.profileStudent.page ?
            this.props.profileStudent.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,autoDisplay:true,
        renderHead: () => (
            <TableHead done = {this.handleChangeFilter}>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: '100%' }}>Học viên</th>
                <th style={{ width: 'auto' }} nowrap='true'>Thông tin liên lạc</th>
                <TableHeadCell name='isDon' content='Đơn' style={{width:'auto'}} nowrap='true' filterType='select' filterData = {filterCondition}/>
                <TableHeadCell name='isHinh' content='Hình' style={{width:'auto'}} nowrap='true'filterType='select' filterData = {filterCondition}/>
                <TableHeadCell name='isIdentityCard' content='CMND/CCCD' style={{width:'auto'}} filterType='select' nowrap='true' filterData = {filterCondition}/>
                <TableHeadCell name='isGiayKhamSucKhoe' content='Giấy khám sức khỏe' style={{width:'auto'}} filterType='select' nowrap='true' filterData = {filterCondition}/>
                <TableHeadCell name='isBangLaiA1' content='Bằng lái A1' style={{width:'auto'}} nowrap='true' filterType='select' filterData = {filterCondition}/>

                <th style={{ width: 'auto' }} nowrap='true'>Hoàn tất</th>
            </TableHead>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize +index + 1} />
                    <TableCell type='text' content={<>{item.lastname} {item.firstname} <br/> {item.identityCard}</>} />
                    <TableCell type='text' content={item.user ? <>{item.user.email} <br/> {item.user.phoneNumber}</> : ''} />
                    <TableCell type='checkbox' isSwitch={false} content={item.isDon} permission={permission} onChanged={active => this.update(item._id, { isDon:active })}/>
                    <TableCell type='checkbox' isSwitch={false} content={item.isHinh} permission={permission} onChanged={active => this.update(item._id, { isHinh:active })}/>
                    <TableCell type='checkbox' isSwitch={false} content={item.isIdentityCard} permission={permission} onChanged={active => this.update(item._id, { isIdentityCard:active })}/>
                    <TableCell type='checkbox' isSwitch={false} content={item.isGiayKhamSucKhoe} permission={permission} onChanged={active => this.update(item._id, { isGiayKhamSucKhoe:active })}/>
                    <TableCell type='checkbox' isSwitch={false} content={item.isBangLaiA1} permission={permission} onChanged={active => this.update(item._id, { isBangLaiA1:active })}/>
                    <TableCell type='checkbox' content={item.isDon && item.isHinh && item.isIdentityCard && item.isGiayKhamSucKhoe && item.isBangLaiA1} />
                
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Bổ sung hồ sơ',
            breadcrumb: ['Bổ sung hồ sơ'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                    <div className='row' style={{marginBottom:'10px'}}>
                        <div className='col-auto'>
                            <label className='col-form-label'>Loại khóa học: </label>
                        </div>
                        <FormSelect ref={e => this.courseType = e} data={this.state.courseTypes} placeholder='Loại khóa học'
                            onChange={data => this.onSearch(data.id)} style={{ margin: 0, width: '200px' }} />
                        {/* <div className='col-auto'>
                            <label className='col-form-label'>Khóa học: </label>
                        </div>
                        <FormSelect ref={e => this.course = e} data={ajaxSelectCourseByCourseType(this.state.courseTypeId)} placeholder='Khóa học'
                            onChange={data => this.onSearch(data.id)} style={{ margin: 0, width: '200px' }} /> */}
                    </div>
                        {table}
                    </div>
                    <Pagination name='pageProfileStudent' getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })}
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}  />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, profileStudent: state.trainning.profileStudent });
const mapActionsToProps = { getProfileStudentPage,updateProfileStudent,getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(ProfileStudentPage);