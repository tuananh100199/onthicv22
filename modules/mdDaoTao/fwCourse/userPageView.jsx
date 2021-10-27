import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import { getRateByUser } from 'modules/_default/fwRate/redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import RateModal from 'modules/_default/fwRate/RateModal';
import { AdminPage, CirclePageButton, PageIconHeader, PageIcon, AdminModal } from 'view/component/AdminPage';

class ViewScoreModal extends AdminModal {
    state = {};
    onShow = (data) => {
        const { student, course } = data;
        this.setState({ student, course });
    };

    render = () => {
        const { student, course } = this.state,
            monThiTotNghiep = course && course.monThiTotNghiep,
            diemThiTotNghiep = student && student.diemThiTotNghiep,
            isLoading = !(monThiTotNghiep && monThiTotNghiep.length && diemThiTotNghiep && diemThiTotNghiep.length);

        return this.renderModal({
            title: 'Điểm thi tốt nghiệp của học viên',
            body:
                <>
                    {!isLoading ? monThiTotNghiep.map((monThi, i) => (
                        <h5 key={i}>{monThi.title + ': '}<span className={diemThiTotNghiep[i].diemLiet ? 'text-danger' : ''}>{diemThiTotNghiep[i].point}</span></h5>
                    )) : null}
                </>
        });
    }
}
class UserCoursePageDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push('/user');
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push('/user');
                    } else if (data.item && data.student) {
                        this.setState(data.item);
                        if (data.teacher) {
                            this.setState({ teacher: data.teacher });
                            this.props.getRateByUser('teacher', data.teacher._id);
                        }
                        this.setState({ student: data.student });
                    } else {
                        this.props.history.push('/user');
                    }
                });
            });
        } else {
            this.props.history.push('/user');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.url != this.props.match.url) {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.setState({ courseId: _id });
            if (_id) {
                T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                    this.props.getCourseByStudent(_id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user');
                        } else if (data.notify) {
                            T.alert(data.notify, 'error', false, 2000);
                            this.props.history.push('/user');
                        } else if (data.item) {
                            this.setState(data.item);
                        } else {
                            this.props.history.push('/user');
                        }
                    });
                });
            } else {
                this.props.history.push('/user');
            }
        }
    }

    render() {
        const course = this.props.course && this.props.course.item,
            subjects = course && course.subjects ? course.subjects : [];
        const { name, courseId, teacher, student } = this.state, rate = this.props.rate.item && this.props.rate.item.value;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: `Khóa học: ${name}`,
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />

                    <PageIcon to={`/user/hoc-vien/khoa-hoc/thong-tin/${courseId}`} icon='fa-info' iconBackgroundColor='#17a2b8' text='Thông tin khóa học' />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/thoi-khoa-bieu`} icon='fa-calendar' iconBackgroundColor='#ffc107' text='Thời khóa biểu' />
                    <PageIcon to='#' icon='fa-graduation-cap ' iconBackgroundColor='#8d6e63' text='Xem điểm thi tốt nghiệp' onClick={(e) => { e.preventDefault(); this.viewScoreModal.show({ student, course }); }} />
                    {/* <PageIcon to={`/user/course/${courseId}/forum`} icon='fa-users' iconBackgroundColor='#8d6e63' text='Forum' /> */}

                    <PageIcon to={''} icon='fa-star' iconBackgroundColor='orange' text='Đánh giá cố vấn học tập' visible={teacher != null}
                        onClick={(e) => { e.preventDefault(); this.modal.show(); }} subtitle={rate ? rate + ' sao' : 'Chưa đánh giá'} />
                    {/* check render */}
                    {teacher && <RateModal ref={e => this.modal = e} title='Đánh giá cố vấn học tập' type='teacher' _refId={teacher._id} />}

                    {subjects.length ? <>
                        <PageIconHeader text='Môn học lý thuyết' />
                        {subjects.map((subject, index) =>
                            !subject.monThucHanh && <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/${courseId}/mon-hoc/${subject._id}`} icon='fa-briefcase' iconBackgroundColor='#1488db' text={subject ? subject.title : ''} />
                        )}
                    </> : null}

                    {subjects.length ? <>
                        <PageIconHeader text='Môn học thực hành' />
                        {subjects.map((subject, index) =>
                            subject.monThucHanh && <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/${courseId}/mon-hoc/${subject._id}`} icon='fa-briefcase' iconBackgroundColor='#1488db' text={subject ? subject.title : ''} />
                        )}
                    </> : null}
                    <PageIconHeader text='Liên lạc' />
                    <PageIcon to={`/user/chat/${courseId}`} icon='fa-comments-o' iconBackgroundColor='#28a745' text='Chat' visible={this.state.chatActive} />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/phan-hoi`} icon='fa-commenting-o' iconBackgroundColor='#dc3545' text='Phản hồi' />

                    <CirclePageButton type='custom' customClassName='btn-success' customIcon='fa-comments-o' onClick={() => this.props.history.push('/user/chat/' + this.state.courseId)} />

                    <ViewScoreModal ref={e => this.viewScoreModal = e} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, driveTest: state.trainning.driveTest, rate: state.framework.rate });
const mapActionsToProps = { getCourseByStudent, getRateByUser, getStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);