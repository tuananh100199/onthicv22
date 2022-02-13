import React from 'react';
import { connect } from 'react-redux';
import { getActiveCourseStudentPage, updateStudent,updateActiveCourse } from './redux';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
class DebtTrackingPage extends AdminPage {
    state = { isSearching: false, searchText: '' };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
        });
        this.props.getActiveCourseStudentPage();
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getActiveCourseStudentPage(pageNumber, pageSize, { searchText }, (page) => {
            this.setState({ searchText, isSearching: false });
            done && done(page);
        }));
    }

    getTotalMoney = (listSuDongTien)=>{
        return listSuDongTien && listSuDongTien.length>0? listSuDongTien.reduce((result,item)=>result+item.fee,0):0;
    }

    isAutoActiveCourse = (item,percent)=>{
        // kiểm tra xem số tiền đã đóng có nhiều hơn tiền phải đóng hay không ?
        const soTienPhaiDong = item.courseFee ? item.courseFee.fee-(item.discount?item.discount.fee:0):0;
        const soTienDaDong = this.getTotalMoney(item.lichSuDongTien);
        return soTienPhaiDong*percent<=soTienDaDong;
    }

    // activeCourse = (isAutoActive,_id,changes) =>{
    //     if(isAutoActive){
    //         T.notify('Học viên đã đóng đủ tiền !', 'danger');
    //     }else{
    //         this.props.updateStudent(_id,changes,this.onSearch({}));
    //     }
    // }

    activeCourse = (value,item,type)=>{
        const typeToText = {
            lyThuyet:'khóa học lý thuyết',
            thucHanh:'khóa học thực hành',
        };
        if(value){ 
            T.confirm(`Kích hoạt ${typeToText[type]}`, `Bạn có chắc muốn kích hoạt ${typeToText[type]} cho học viên <b>${item.lastname} ${item.firstname}</b> không? Dữ liệu sau khi được kích hoạt sẽ không thể thay đổi`, 'info', isConfirm => {
                isConfirm &&this.props.updateActiveCourse(item._id,type,()=>this.onSearch({}));
            });
        }
    }

    render() {
        const permission = this.getUserPermission('activeCourse', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0 };
        
        
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa lý thuyết</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa thực hành</th>
                </tr>),
            renderRow: (item, index) => {
                return <tr key={index}>
                <TableCell type='number' content={index + 1} />
                <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.courseType && item.courseType.title} style={{ whiteSpace: 'nowrap' }} />
                <TableCell content={item.course && item.course.name} style={{ whiteSpace: 'nowrap' }} />
                {/* <TableCell type='checkbox' content={isAutoActiveLyThuyet || item.activeKhoaLyThuyet} permission={permission} onChanged = {value=>this.activeCourse(isAutoActiveLyThuyet,item._id,{activeKhoaLyThuyet:value})}/> */}
                {/* <TableCell type='checkbox' content={isAutoActiveThucHanh || item.activeKhoaThucHanh} permission={permission} onChanged = {value=>this.activeCourse(isAutoActiveThucHanh,item._id,{activeKhoaThucHanh:value})}/> */}
                <TableCell type='checkbox' content={item.course!=null} permission={permission} onChanged = {value=>this.activeCourse(value,item,'lyThuyet')}/>
                <TableCell type='checkbox' content={(item.course &&!item.course.isDefault)}/>
            </tr>;
            }
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Kích hoạt khóa học',
            breadcrumb: ['Kích hoạt khóa học'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getActiveCourseStudentPage, updateStudent,updateActiveCourse };
export default connect(mapStateToProps, mapActionsToProps)(DebtTrackingPage);
