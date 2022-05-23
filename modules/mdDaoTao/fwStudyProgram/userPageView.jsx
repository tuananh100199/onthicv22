import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from 'modules/mdDaoTao/fwCourse/redux';
import { getStudyProgramItem } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';


const previousRoute = '/user';
class UserCourseInfo extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/chuong-trinh-hoc/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item && data.item.courseType) {
                        this.props.getStudyProgramItem({courseType: data.item.courseType._id, active: true}, dataChuongTrinhHoc => {
                            if (dataChuongTrinhHoc.error) {
                                T.notify('Lấy chương trình học bị lỗi!', 'danger');
                                this.props.history.push('/user/study-program');
                            } else if (dataChuongTrinhHoc.item) {
                                this.setState({data: dataChuongTrinhHoc.item, name: data.item.name});
                            } else {
                                this.props.history.push('/user/hoc-vien/khoa-hoc/' + _id);
                            }
                        });
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        // const hocPhiConLai = this.state.hocPhiPhaiDong && T.numberDisplay(this.state.hocPhiPhaiDong - (this.state.hocPhiDaDong ? this.state.hocPhiDaDong : 0) - (this.state.hocPhiMienGiam ? this.state.hocPhiMienGiam : 0));
        const studyProgram = this.props.studyProgram ? this.props.studyProgram.item || {} : {};
        console.log(studyProgram);
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Chi tiết khóa học'],
            content: (
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>{studyProgram.title}</h3>
                        <label className='col-md-6'>Môn học: <b>{studyProgram.monHoc}</b></label>
                        <label className='col-md-6'>Thời gian: <b>{studyProgram.time}</b></label>
                        <label className='col-md-6'>Nội dung lý thuyết: <b>{studyProgram.lyThuyet}</b></label>
                        <label className='col-md-6'>Nội dung thực hành: <b>{studyProgram.thucHanh}</b></label>
                        <label className='col-md-6'>Hình thức kiểm tra: <b>{studyProgram.kiemTra}</b></label>
                        <label className='col-md-6'>Ghi chú: <b>{studyProgram.note}</b></label>
                    </div>
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, studyProgram: state.trainning.studyProgram});
const mapActionsToProps = { getCourseByStudent, getStudyProgramItem };
export default connect(mapStateToProps, mapActionsToProps)(UserCourseInfo);
