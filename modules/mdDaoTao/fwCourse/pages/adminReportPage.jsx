import React from 'react';
import { connect } from 'react-redux';
import { getCourse, exportTN07 } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIconHeader, PageIcon, AdminModal, FormTextBox } from 'view/component/AdminPage';
import FileSaver from 'file-saver';

const backRoute = '/user/course';

class SoLuongHocVienModal extends AdminModal {
    state = {};
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemSoLuongHocVien.focus()));
    }

    onShow = (item) => {
        const { _id, soLuongHocVien} = item || { _id: null, soLuongHocVien};
        this.itemSoLuongHocVien.value(soLuongHocVien || '');
        this.setState({_id: _id });
    }

    exportTN07 = () => {
        const courseId = this.props.courseId;
        if(!this.itemSoLuongHocVien.value()){
            T.notify('Số lượng học viên không được trống!', 'danger');
        } else if(courseId){
            this.props.exportTN07(courseId,this.itemSoLuongHocVien.value(), (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'QĐ Cong Nhan Tot Nghiep.docx');
            });
        } else{
            T.notify('Danh sách học viên trống!', 'danger');
        }
    };

    render = () => this.renderModal({
        title: 'Chỉnh sửa số lượng học viên',
        body: (
            <div>
                <FormTextBox ref={e => this.itemSoLuongHocVien = e} label='Số lượng học viên tốt nghiệp' readOnly={false} />
            </div>),
        buttons: <a className='btn btn-warning' href='#' onClick={() => this.exportTN07()} style={{ color: 'white' }}>
            <i className='fa fa-lg fa-paper-plane' /> Xuất file excel
        </a> 
    });
}
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
        const permission = this.getUserPermission('course', ['report']);
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Báo cáo khóa học: ' + item.name,
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học</Link>, item.name],
            content: (
                <div className='row user-course'>
                    <PageIconHeader visible={isCourseAdmin || permission} text='Báo cáo 1' />
                    <PageIcon visible={isCourseAdmin || permission } to={`/user/course/${item._id}/report/dang-ky-sat-hach`} icon='fa-file-word-o' iconBackgroundColor='#17a2b8' text='Đăng ký sát hạch lái xe (PL3A)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-hoc-vien`} icon='fa-file-word-o' iconBackgroundColor='#1488db' text='Lập danh sách học viên (PL3B)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/ke-hoach-dao-tao`} icon='fa-file-word-o' iconBackgroundColor='#dc143c' text='Lập kế hoạch đào tạo (PL4)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/xe-tap-lai`} icon='fa-file-word-o' iconBackgroundColor='#dc143c' text='Danh sách xe tập lái khoá (PL8)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/tien-do-dao-tao`} icon='fa-file-word-o' iconBackgroundColor='#9ccc65' text='Tiến độ đào tạo (PL5)' />

                    <PageIconHeader visible={isCourseAdmin || permission} text='Báo cáo tổng hợp' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/theo-doi-thuc-hanh`} icon='fa-file-word-o' iconBackgroundColor='#D00' text='Theo dõi thực hành (PL6)' />
                    {/* <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/qua-trinh-hoc`} icon='fa-file-word-o' iconBackgroundColor='#8A0' text='Báo cáo quá trình học (DT01)' /> */}
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/thi-het-mon`} icon='fa-file-word-o' iconBackgroundColor='#CC0' text='Tổng hợp thi hết môn (DT03)' />
                
                    <PageIconHeader visible={isCourseAdmin || permission} text='Báo cáo tốt nghiệp' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/bien-ban-du-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Biên bản xét dự thi tốt nghiệp (TN01)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-du-thi-tot-nghiep`} icon='fa-file-excel-o' iconBackgroundColor='teal' text='Danh sách học viên xét dự thi tốt nghiệp (TN02)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/hoi-dong-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#9ced65' text='Quyết định thành lập hội đồng thi tốt nghiệp (TN03)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/hop-hoi-dong-thi-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#900' text={'Biên bản họp hội đồng thi tốt nghiệp (TN04)'}/>
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/ban-coi-cham-thi`} icon='fa-file-word-o' iconBackgroundColor='#DAA520' text={'Ban coi chấm thi (TN05)'} />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-hoc-vien-thi-tot-nghiep`} icon='fa-file-excel-o' iconBackgroundColor='orange' text='Danh sách học viên dự thi tốt nghiệp (TN06)' />
                    <PageIcon visible={isCourseAdmin || permission} to={'#'} icon='fa-file-word-o' iconBackgroundColor='teal' text='Quyết định công nhận tốt nghiệp (TN07)' onClick={() => this.modal.show()} />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/xet-ket-qua-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#9ced65' text='Biên bản họp xét kết quả tốt nghiệp (TN08)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-hoc-vien-tot-nghiep`} icon='fa-file-word-o' iconBackgroundColor='#900' text={'Danh sách học viên tốt nghiệp (TN09)'}/>
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/bang-diem-thi-tot-nghiep`} icon='fa-file-excel-o' iconBackgroundColor='#DAA520' text={'Bảng điểm thi tốt nghiệp (TN10)'} />

                    <PageIconHeader visible={isCourseAdmin || permission} text='Báo cáo sát hạch' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/sat-hach-lai-xe`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Báo cáo đề nghị tổ chức sát hạch lái xe (PL11A)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach`} icon='fa-file-word-o' iconBackgroundColor='teal' text='Danh sách học viên dự thi sát hạch (PL11B)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-lai`} icon='fa-file-word-o' iconBackgroundColor='#9ced65' text='Danh sách thí sinh được phép dự sát hạch lại để cấp GPLX (SH01)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-gplx-hang`} icon='fa-file-word-o' iconBackgroundColor='#900' text={'Danh sách thí sinh dự thi sát hạch để cấp GPLX các hạng (PL12B)'}/>
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-gplx`} icon='fa-file-word-o' iconBackgroundColor='#DAA520' text={'Danh sách thí sinh dự thi sát hạch để cấp GPLX (PL12C)'} />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/danh-sach-du-thi-sat-hach-lai-gplx`} icon='fa-file-word-o' iconBackgroundColor='orange' text='Danh sách thí sinh dự thi sát hạch lại để cấp lại GPLX (PL13)' />
                    <PageIcon visible={isCourseAdmin || permission} to={`/user/course/${item._id}/report/bang-diem-thi-sat-hach`} icon='fa-file-excel-o' iconBackgroundColor='teal' text='Bảng điểm thi sát hạch (SH02)' />
                    <SoLuongHocVienModal readOnly={false} courseId={item._id} ref={e => this.modal = e} exportTN07={this.props.exportTN07} />
                </div>
            ),
            backRoute: backRoute + '/' + item._id,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, exportTN07 };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
