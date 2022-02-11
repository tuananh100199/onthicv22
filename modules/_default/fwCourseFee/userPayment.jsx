import React from 'react';
import { connect } from 'react-redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getUserCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, PageIcon, FormSelect } from 'view/component/AdminPage';
class UserCoursePageDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/cong-no/:_id'),
            _id = route.parse(window.location.pathname)._id;
        const userId = this.props.system && this.props.system.user && this.props.system.user._id;
        this.props.system && this.props.system.user && this.props.getUserCourse(data => {
            const students = data.students;
            const listCourseType = students.length && students.map(student => {
                if(student.courseType)
                    return {id: student.courseType._id, text: student.courseType.title};
            });
            this.setState({ listCourseType}, () =>  this.courseType.value(_id));
        });
        this.setState({ courseTypeId: _id });
        if (_id) {
            T.ready('/user', () => {
                this.props.getStudent({user: userId, courseType: _id}, data => {
                    if (data) {
                        this.setState({student: data});
                    } else {
                        this.props.history.push('/user');
                    }
                });
            });
        } else {
            this.props.history.push('/user');
        }
    }

    render() {
        const { student, listCourseType = [] } = this.state;
        const name = student && student.courseType && student.courseType.title;
        const courseTypeId = student && student.courseType && student.courseType._id;
        const userPageLink = '/user';
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: `Học phí: ${name}`,
            breadcrumb: ['Theo dõi công nợ'],
            content: (
                <div className='row user-course'>
                    <div className='col-md-12'>
                        <FormSelect style={{ width: '300px'}} ref={e => this.courseType = e} label='Khoá' data={listCourseType} onChange={data => {
                            this.props.history.push('/user/hoc-vien/cong-no/' + data.id);
                            window.location.reload();
                        }}/>
                    </div>
                    <PageIcon to={`/user/hoc-vien/cong-no/${courseTypeId}/chinh-thuc`} icon='fa-credit-card' iconBackgroundColor='#17a2b8' text='Học phí chính thức' />
                    <PageIcon to={`/user/hoc-vien/cong-no/${courseTypeId}/tang-them`} icon='fa-plus' iconBackgroundColor='#3e24aa' text='Học phí tăng thêm' />
                    <PageIcon to={`/user/hoc-vien/cong-no/${courseTypeId}/lich-su`} icon='fa-history' iconBackgroundColor='#8d74aa' text='Lịch sử thanh toán' />
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getStudent, getUserCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);