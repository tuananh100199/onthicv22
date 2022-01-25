import React from 'react';
import { connect } from 'react-redux';
import { getProfileStudentPage,updateProfileStudent } from './redux';
import { AdminPage, renderTable, TableCell,FormSelect,FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';

const filterConditionData = [
    {id:'all',text:'Tất cả'},
    {id:'done',text:'Hoàn tất'},
    {id:'notDone',text:'Chưa hoàn tất'},
];
class ProfileStudentPage extends AdminPage {
    state = {defaultFilterValue:'all',filterCondition:{},searchText:'',isExpandFilter:true};
    componentDidMount() {
        T.ready('/user/student-profile', () => {
            T.showSearchBox(() => {this.setState({filterCondition:{}});});
            T.onSearch = (searchText) => this.onSearch({searchText},()=>this.setState({searchText}));
            this.itemHoanTat.value(this.state.defaultFilterValue);
            // this.props.getCourseTypeAll(data => {
            //     const courseTypes = data.length && data.map(item => ({ id: item._id, text: item.title }));
            //     this.courseType.value(courseTypes.length ? courseTypes[0] : null);
            //     this.onSearch({});
            // });

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

    onChangeFilter = value=> value=='notDone'?this.setState({isExpandFilter:false}):this.setState({isExpandFilter:true});

    handleFilter = ()=>{
        let filterCondition={};
        filterCondition.profileType = this.itemHoanTat.value();
        if(filterCondition.profileType=='notDone'){
            filterCondition.isDon = this.itemIsDon.value();
            filterCondition.isHinh = this.itemIsHinh.value();
            filterCondition.isIdentityCard = this.itemIsIdentityCard.value();
            filterCondition.isGiayKhamSucKhoe = this.itemIsGiayKhamSucKhoe.value();
            filterCondition.isBangLaiA1 = this.itemIsBangLaiA1.value();
        }
        this.onSearch({filterCondition},()=>{
            this.setState({filterCondition});
        });
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
        // const teacherGroup = item && item.teacherGroups ? item.teacherGroups.find(group => group.teacher && group.teacher._id == currentUser._id) : null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thông tin liên lạc</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Đơn</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Hình</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Giấy khám sức khỏe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Bằng lái A1</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Hoàn tất</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize +index + 1} />
                    <TableCell type='text' content={<>{item.lastname} {item.firstname} <br/> {item.identityCard}</>} />
                    <TableCell type='text' content={item.user ? <>{item.user.email} <br/> {item.user.phoneNumber}</> : ''} />
                    <TableCell type='checkbox' content={item.isDon} permission={permission} onChanged={active => this.update(item._id, { isDon:active })}/>
                    <TableCell type='checkbox' content={item.isHinh} permission={permission} onChanged={active => this.update(item._id, { isHinh:active })}/>
                    <TableCell type='checkbox' content={item.isIdentityCard} permission={permission} onChanged={active => this.update(item._id, { isIdentityCard:active })}/>
                    <TableCell type='checkbox' content={item.isGiayKhamSucKhoe} permission={permission} onChanged={active => this.update(item._id, { isGiayKhamSucKhoe:active })}/>
                    <TableCell type='checkbox' content={item.isBangLaiA1} permission={permission} onChanged={active => this.update(item._id, { isBangLaiA1:active })}/>
                    <TableCell type='checkbox' content={item.isDon && item.isHinh && item.isIdentityCard && item.isGiayKhamSucKhoe && item.isBangLaiA1} />
                
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Bổ sung hồ sơ',
            breadcrumb: ['Bổ sung hồ sơ'],
            advanceSearch: <>
                <div className='tile-body row'>
                    <FormSelect ref={e => this.itemHoanTat = e} onChange = {value=>this.onChangeFilter(value.id)} label='Tình trạng hồ sơ' data={filterConditionData} className='col-md-12' />
                </div>

                <h6 className='tile-title mt-3' style={{display:this.state.isExpandFilter?'none':'block'}}>Các mục chưa hoàn tất</h6>
                <div className='tile-body row' style={{display:this.state.isExpandFilter?'none':'flex'}}>
                <FormCheckbox ref={e => this.itemIsDon = e} className='col-md-4' label='Đơn' />
                <FormCheckbox ref={e => this.itemIsHinh = e} className='col-md-4' label='Hình' />
                <FormCheckbox ref={e => this.itemIsIdentityCard = e} className='col-md-4' label='CMND/CCCD' />
                <FormCheckbox ref={e => this.itemIsGiayKhamSucKhoe = e} className='col-md-4' label='Giấy khám sức khỏe' />
                <FormCheckbox ref={e => this.itemIsBangLaiA1 = e} className='col-md-4' label='Bằng lái A1' />
                </div>

                <div className='m-auto'>
                    <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilter}>
                        <i className='fa fa-filter' /> Lọc danh sách
                    </button>
                </div>
            </>,
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