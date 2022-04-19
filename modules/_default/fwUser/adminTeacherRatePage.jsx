import React from 'react';
import { connect } from 'react-redux';
import { getTeacherRatePage } from './redux';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell } from 'view/component/AdminPage';
import StarRatings from 'react-star-ratings';
import Pagination from 'view/component/Pagination';


const ratingValue = [
    {id:'0',text:'0'},
    {id:'1',text:'từ 1 đến 2'},
    {id:'2',text:'từ 2 đến 3'},
    {id:'3',text:'từ 3 đến 4'},
    {id:'4',text:'từ 4 đến 5'},
    {id:'5',text:'5'},
];
class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready( () => {
            this.props.getTeacherRatePage(1,null,{isLecturer:true},{},{});
        });
    }

    star = (score, count=0) => {
        return (
            <div className='d-flex align-items-center justify-content-center'>
                <span className='text-primary' style={{ fontSize:'40px', paddingRight: '15px', color:'#ffca08'}}>{Number(score).toFixed(1)+'   '}</span>
                <div>
                    <StarRatings
                        rating={score}
                        starRatedColor={score >=4  ? '#28a745' : (score < 3 ? '#dc3545' : '#ffca08')}
                        numberOfStars={5}
                        name='rating'
                        starDimension='20px'
                    />
                    <p><i className='fa fa-user-o' aria-hidden='true'></i>{'  ' + count}</p>
                </div>
                 
            </div>
        );
    }

    render() {
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.user && this.props.user.page ?
        this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0 };        
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getTeacherRatePage}>
                    <TableHeadCell style={{ width: 'auto' }}>#</TableHeadCell>
                    <TableHeadCell style={{ width: '20%' }} name='fullName' sort={true} filter='search'>Giáo viên</TableHeadCell>
                    <TableHeadCell style={{ width: '20%',textAlign:'center' }}>Hình ảnh giáo viên</TableHeadCell>
                    <TableHeadCell style={{ width: '60%',textAlign:'center' }} name='ratingScore' sort={true} filter='select' filterData={ratingValue}>Điểm đánh giá</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={`${item.lastname} ${item.firstname}`} url={`/user/manage-lecturer/${item._id}/rating`} />
                    <TableCell type='image' height='50px' content={item.image ? item.image : '/img/avatar-default.png'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.star(item.ratingScore||0, item.ratingAmount)} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá Giáo viên',
            breadcrumb: ['Đánh giá Giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination name='teacherRate' pageCondition={{isLecturer:true}} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTeacherRatePage} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate,user: state.framework.user, });
const mapActionsToProps = { getTeacherRatePage };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
