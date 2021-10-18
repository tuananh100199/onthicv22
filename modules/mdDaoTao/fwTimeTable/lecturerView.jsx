import React from 'react';
import { connect } from 'react-redux';
import { getStudentByLecturer } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class LecturerView extends AdminPage {
    componentDidMount() {
        const route = T.routeMatcher('/user/course/:courseId'),
            courseId = route.parse(window.location.pathname).courseId;

        if (courseId) {
            this.setState({ courseId });

            T.ready('/user/course/' + courseId, () => {
                this.props.getStudentByLecturer(this.props.courseId, data => {
                    this.setState({ listStudent: data.item });
                });
            });
        } else {
            this.props.history.push(`/user/course/${this.state.courseId}`);
        }
    }

    render() {
        const permission = this.getUserPermission('timeTable');
        const table = renderTable({
            getDataSource: () => this.state && this.state.listStudent || [],
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
                    <TableCell type='text' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.user && item.user.email} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/course/' + this.state.courseId + '/student/' + item._id + '/time-table'} />
                </tr >),
        });
        return <div className='tile-body'>{table}</div>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStudentByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerView);