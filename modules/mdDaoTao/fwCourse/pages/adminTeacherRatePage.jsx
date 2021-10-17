import React from 'react';
import { connect } from 'react-redux';
import { getRatePage } from 'modules/_default/fwRate/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class AdminTeacherRatePage extends AdminPage {
    state={_courseId:''};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/rate-teacher').parse(window.location.pathname),
             {_id= null} = params;
                if (_id) {
                    this.setState({_courseId:_id},()=>{
                        const condition={type:'teacher',_courseId:this.state._courseId};
                        this.props.getRatePage(1,50,condition, data => {
                            if (data.error) {
                                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                                this.props.history.push('/user/course/');
                            }
                        });
                    });
                } else {
                    this.props.history.push('/user/course/');
                }
        });
    }

    render() {
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.rate && this.props.rate.page ?
        this.props.rate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Học viên đánh giá</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cố vấn học tập được đánh giá</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số sao</th>
                    <th style={{ width: '100%' }}>Nội dung đánh giá</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.user && item.user.lastname} ${item.user && item.user.firstname}`}/>
                    <TableCell type='text' content={`${item._refId && item._refId.lastname} ${item._refId && item._refId.firstname}`} />
                    <TableCell type='number' content={item.value} />
                    <TableCell type='text' content={item.note||''} />
                </tr>),
        });
        
        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá cố vấn học tập',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Đánh giá cố vấn học tập'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                    <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                getPage={this.props.getRatePage} /> 
                </div>
                ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate});
const mapActionsToProps = { getRatePage };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
