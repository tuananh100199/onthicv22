import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

const backRoute = '/user/course';
class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getCourse(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(backRoute);
                    }
                });
            } else {
                this.props.history.push(backRoute);
            }
        });
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isCourseAdmin } = currentUser,
            item = this.props.course && this.props.course.item ? this.props.course.item : {};
        // const permission = this.getUserPermission('course', ['report']);
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Báo cáo khóa học: ' + item.name,
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học</Link>, item.name],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Báo cáo 1' />
                    <PageIcon visible={isCourseAdmin } to={`/user/course/${item._id}/report/dang-ky-sat-hach`} icon='fa-file-word-o' iconBackgroundColor='#17a2b8' text='Đăng ký sát hạch lái xe (PL3A)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-hoc-vien`} icon='fa-file-word-o' iconBackgroundColor='#1488db' text='Lập danh sách học viên (PL3B)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/ke-hoach-dao-tao`} icon='fa-file-word-o' iconBackgroundColor='#dc143c' text='Lập kế hoạch đào tạo (PL4)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/xe-tap-lai`} icon='fa-file-word-o' iconBackgroundColor='#dc143c' text='Danh sách xe tập lái khoá (PL8)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/tien-do-dao-tao`} icon='fa-file-word-o' iconBackgroundColor='#9ccc65' text='Tiến độ đào tạo (PL5)' />

                    <PageIconHeader text='Báo cáo tổng hợp' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/theo-doi-thuc-hanh`} icon='fa-file-word-o' iconBackgroundColor='#D00' text='Theo dõi thực hành (PL6)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/qua-trinh-hoc`} icon='fa-file-word-o' iconBackgroundColor='#8A0' text='Báo cáo quá trình học (DT01)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/thi-het-mon`} icon='fa-file-word-o' iconBackgroundColor='#CC0' text='Tổng hợp thi hết môn (DT03)' />
                
                    <PageIconHeader text='Báo cáo tốt nghiệp' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/bien-ban-du-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Biên bản xét dự thi tốt nghiệp (TN01)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-du-thi-tot-nghiep`} icon='fa-file-excel-o' iconBackgroundColor='teal' text='Danh sách học viên xét dự thi tốt nghiệp (TN02)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/hoi-dong-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#9ced65' text='Quyết định thành lập hội đồng thi tốt nghiệp (TN03)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/hop-hoi-dong-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#900' text={'Biên bản họp hội đồng thi tốt nghiệp (TN04)'}/>
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/ban-coi-cham-thi`} icon='fa-file-word-o' iconBackgroundColor='#DAA520' text={'Ban coi chấm thi (TN05)'} />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-hoc-vien-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Danh sách học viên dự thi tốt nghiệp (TN06)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/cong-nhan-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='teal' text='Quyết định công nhận tốt nghiệp (TN07)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/xet-ket-qua-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#9ced65' text='Biên bản họp xét kết quả tốt nghiệp (TN08)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-hoc-vien-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#900' text={'Danh sách học viên tốt nghiệp (TN09)'}/>
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/bang-diem-thi-tot-nghiep`} icon='fa-file-excel-o' iconBackgroundColor='#DAA520' text={'Bảng điểm thi tốt nghiệp (TN10)'} />

                    <PageIconHeader text='Báo cáo sát hạch' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/sat-hach-lai-xe`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Báo cáo đề nghị tổ chức sát hạch lái xe (PL11A)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach`} icon='fa-file-word-o' iconBackgroundColor='teal' text='Danh sách học viên dự thi sát hạch (PL11B)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-lai`} icon='fa-file-word-o' iconBackgroundColor='#9ced65' text='Danh sách thí sinh được phép dự sát hạch lại để cấp GPLX (SH01)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-gplx-hang`} icon='fa-file-word-o' iconBackgroundColor='#900' text={'Danh sách thí sinh dự thi sát hạch để cấp GPLX các hạng (PL12B)'}/>
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-gplx`} icon='fa-file-word-o' iconBackgroundColor='#DAA520' text={'Danh sách thí sinh dự thi sát hạch để cấp GPLX (PL12C)'} />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-lai-gplx`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Danh sách thí sinh dự thi sát hạch lại để cấp lại GPLX (PL13)' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/report/bang-diem-thi-sat-hach`} icon='fa-file-excel-o' iconBackgroundColor='teal' text='Bảng điểm thi sát hạch (SH02)' />

                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
