import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class CourseAdminView extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/course/:courseId'),
        courseId = route.parse(window.location.pathname).courseId;

        if (courseId) {
            this.setState({ courseId: courseId});
            T.ready('/user/course/' + courseId, () => {
                this.props.getStudentPage(undefined, undefined, { course: courseId });
            });
        } else {
            this.props.history.push(`/user/course/${this.state.courseId}`);
        }  
    }
    
    render() {
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
        this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
        getDataSource: () => list && list.filter(item => item.course != null),
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: '50%' }}>Họ và Tên</th>
                <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                <th style={{ width: 'auto' }} nowrap='true'>Thông tin liên hệ</th>
                <th style={{ width: '50%' }} nowrap='true'>Cơ sở đào tạo</th>
                <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='text' content={index + 1}/>
                <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                <TableCell type='text' content={item.identityCard} />
                <TableCell type='text' content={item.user && item.user.email} />
                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/course/' + this.state.courseId + '/student/' + item._id + '/time-table'} />
            </tr >),
        });
        return <> 
            <div className='tile-body'>{table}</div>
            <Pagination name='adminStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                getPage={this.props.getStudentPage} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student});
const mapActionsToProps = { getStudentPage };
export default connect(mapStateToProps, mapActionsToProps)(CourseAdminView);

