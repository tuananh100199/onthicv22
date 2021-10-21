import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgressPage } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, FormTextBox, FormFileBox } from 'view/component/AdminPage';
import './style.scss';

class AdminImportDiemThiTotNghiepPage extends AdminPage {
    state = { filterOn: false };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/import-diem-thi-tot-nghiep').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                this.setState({ courseId: params._id });
                if (course) {
                    this.props.getLearningProgressPage(undefined, undefined, { courseId: course._id, filterOn: this.state.filterOn });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getLearningProgressPage(undefined, undefined, { courseId: params._id, filterOn: this.state.filterOn });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {},
            listMonThi = item && item.monThiTotNghiep;
        const filebox = (
            <>
                <h3 className='tile-title'>Import điểm thi tốt nghiệp</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='DiemThiTotNghiepFile'
                    onSuccess={this.onUploadSuccess} r />
            </>
        );
        const componentSetting = (
            <>
                <div className='row'>
                    <FormTextBox className='col-md-3' label='Dòng bắt đầu' />
                    <FormTextBox className='col-md-3' label='Dòng kết thúc' />
                    <FormTextBox className='col-md-3' label='Cột họ và tên' />
                    <FormTextBox className='col-md-3' label='Cột ngày tháng năm sinh' />
                    {listMonThi && listMonThi.length && listMonThi.map((monThi, index) =>
                        (<FormTextBox key={index} className='col-md-3' label={'Môn thi: ' + monThi.title} />)
                    )}
                </div>
            </>);
        const backRoute = `/user/course/${item._id}/learning`;
        const backRouteCourse = `/user/course/${item._id}/learning`;
        return this.renderPage({
            icon: 'fa fa-table',
            title: 'Nhập điểm thi tốt nghiệp: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRouteCourse}>{item.name}</Link> : '', item._id ? <Link key={0} to={backRoute}>Tiến độ học tập</Link> : '', 'Nhập điểm thi tốt nghiệp'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {componentSetting}
                        {filebox}
                    </div>
                </div>
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminImportDiemThiTotNghiepPage);