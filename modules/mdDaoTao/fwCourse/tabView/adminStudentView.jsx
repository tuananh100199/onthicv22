import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, updateStudent, getStudentPage } from 'modules/mdDaoTao/fwStudent/redux';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import Pagination from 'view/component/Pagination';
import { FormTextBox } from 'view/component/AdminPage';

const previousRoute = '/user/course';
class AdminStudentView extends React.Component {
    state = {
        sortType: {
            student: 'name',
            preStudent: 'name'
        }
    };
    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props.course) !== JSON.stringify(prevProps.course)) {
            this.props.getPreStudentPage(1, 50, { courseType: this.props.courseType && this.props.courseType._id });
            const route = T.routeMatcher('/user/course/:_id'),
                _id = route.parse(window.location.pathname)._id;
            if (_id) {
                this.props.getStudentPage(1, 50, { course: _id });
            } else {
                this.props.history.push(previousRoute);
            }
        }
    }
    onClick = (_studentId, typeOnClick) => {
        if (typeOnClick == 'add') {
            this.props.updateStudent(_studentId, { course: this.props.course.item._id });
        } else if (typeOnClick == 'remove') {
            this.props.updateStudent(_studentId, { $unset: { course: 1 } });
        }
    }

    render() {
        // console.log(this.props.course, 'djdjdjd')
        const
            // permission = this.props.permission,
            // permissionUser = this.props.permissionUser,
            outsides = (list, isOutside) => list && list.filter(item => item.division && item.division.isOutside == isOutside),
            divisions = (list) =>
                list.reduce((result, student) => !result.find(division => JSON.stringify(division) == JSON.stringify(student.division)) ? [...result, student.division] : result, [])
            ,
            pageInfo = (page) =>
            (this.props.student && page ?
                page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] }),
            page = pageInfo(this.props.student.page),
            prePage = pageInfo(this.props.student.prePage),
            renderPagination = (name, page, action, pos) => <Pagination style={{ left: pos }} name={name} pageCondition={page.pageCondition} pageNumber={page.pageNumber} pageSize={page.pageSize} pageTotal={page.pageTotal} totalItem={page.totalItem}
                getPage={action} />;
        const renderStudents = (list, division, typeOnClick) =>
            <ol style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                {list.sort((a, b) => a.firstName && a.firstName.localeCompare(b.firstName) ||
                    a.lastName && a.lastName.localeCompare(b.lastName)).reduce((result, student, index) => JSON.stringify(division) == JSON.stringify(student.division) ? [...result,
                    <li key={index}
                        onClick={this.onClick(student._id, typeOnClick)}
                    >{student.lastname} {student.firstname}</li>] : result, [])}
            </ol>,
            renderDivisions = (list, isOutside, typeOnClick) =>
                list && list.length ? divisions(list) && divisions(list).reduce((result, division, index) => division && division.isOutside == isOutside ? [...result, (
                    <div key={index} style={{ marginTop: 0 }}>
                        <h6 style={{ paddingTop: 20 }}>{division.title}</h6>
                        {renderStudents(list, division, typeOnClick)}
                    </div>)] : result, []) : 'Không có thông tin';

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBoxPre = e} label='Tìm kiếm ứng viên' onChange={e => this.props.getPreStudentPage(1, 50, { searchText: e.target.value, courseType: this.props.courseType._id })} />
                        <div>
                            <h5>Ứng viên thuộc cơ sở Hiệp Phát</h5>
                            {renderDivisions(outsides(prePage.list, false), false, 'add')}
                            <h5 style={{ marginTop: 10 }}>Ứng viên thuộc cơ sở ngoài</h5>
                            {renderDivisions(outsides(prePage.list, true), true, 'add')}
                            {renderPagination('adminPreStudent', prePage, this.props.getPreStudentPage, 320)}
                        </div>
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Học viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getStudentPage(1, 50, { searchText: e.target.value, course: this.props.course.item._id })} />
                        <div>
                            <h5>Học viên thuộc cơ sở Hiệp Phát</h5>
                            {renderDivisions(outsides(page.list, false), false, 'remove')}
                            <h5>Học viên thuộc cơ sở ngoài</h5>
                            {renderDivisions(outsides(page.list, true), true, 'remove')}
                            {renderPagination('adminStudent', page, this.props.getStudentPage, 850)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student, course: state.course });
const mapActionsToProps = { getDivisionAll, getPreStudentPage, updateStudent, getStudentPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
