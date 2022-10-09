import React from 'react';
import { connect } from 'react-redux';
import { getCourse, getAdditionalProfilePage,updateAdditionalProfile } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell,FormSelect,FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

const filterConditionData = [
    {id:'all',text:'Tất cả'},
    {id:'done',text:'Hoàn tất'},
    {id:'notDone',text:'Chưa hoàn tất'},
];
class LecturerStudentPage extends AdminPage {
    state = {defaultFilterValue:'all',filterCondition:{},searchText:'',isExpandFilter:true};
    componentDidMount() {
        T.ready('/user/course', () => {
            T.showSearchBox(() => {this.setState({filterCondition:{}});});
            T.onSearch = (searchText) => this.onSearch({searchText},()=>this.setState({searchText}));
            this.itemHoanTat.value(this.state.defaultFilterValue);
            const params = T.routeMatcher('/user/course/:_id/additional-profile').parse(window.location.pathname);
            if (params && params._id) {
                this.setState({courseId:params._id});
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getAdditionalProfilePage(undefined, undefined, { courseId: course._id });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getAdditionalProfilePage(undefined, undefined, { courseId: params._id });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    onSearch = ({pageNumber,pageSize,searchText},done)=>{
        let condition = {
            courseId:this.state.courseId,
            filterCondition:this.state.filterCondition
        };
        searchText?condition.searchText = searchText:condition.searchText=this.state.searchText;
        this.props.getAdditionalProfilePage(pageNumber,pageSize,condition,()=>done && done());
    }
    
    update = (_id,change)=>{
        this.props.updateAdditionalProfile(_id,change,()=>{
            this.onSearch({});
        });
    };

    onChangeFilter = value=> value=='notDone'?this.setState({isExpandFilter:false}):this.setState({isExpandFilter:true});

    handleFilter = ()=>{
        const {courseId,searchText} = this.state;
        let filterCondition={};
        filterCondition.profileType = this.itemHoanTat.value();
        if(filterCondition.profileType=='notDone'){
            filterCondition.isDon = this.itemIsDon.value();
            filterCondition.isHinh = this.itemIsHinh.value();
            filterCondition.isIdentityCard = this.itemIsIdentityCard.value();
            filterCondition.isGiayKhamSucKhoe = this.itemIsGiayKhamSucKhoe.value();
            filterCondition.isBangLaiA1 = this.itemIsBangLaiA1.value();
        }
        this.props.getAdditionalProfilePage(undefined,undefined,{courseId,searchText,filterCondition},()=>{
            this.setState({filterCondition});
        });
    }
    render() {
        const permission = this.getUserPermission('course');
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.course && this.props.course.profilePage ?
            this.props.course.profilePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
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

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Bổ sung hồ sơ: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Bổ sung hồ sơ'],
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
                    <div className='tile-body'>{table}</div>
                    <Pagination name='additionalProfilePage' style={{marginLeft:'40px',marginBottom:'5px'}} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })}
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}  />
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getAdditionalProfilePage,updateAdditionalProfile };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);