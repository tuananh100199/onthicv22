import React from 'react';
import { connect } from 'react-redux';
import { getVerificationImage, updateVerificationImage, deleteStudentVerificationImage } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, TableCell, renderTable, } from 'view/component/AdminPage';

class AdminVerificationImagePage extends AdminPage {
    state = {};
    componentDidMount() {

        const setData = (data) => {
            const { title} = data;
            this.name.value(title);
        };

        T.ready('/user/review-class', () => {
            const params = T.routeMatcher('/user/review-class/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getVerificationImage(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy lớp ôn tập bị lỗi!', 'danger');
                        this.props.history.push('/user/review-class');
                    } else if (data) {
                        setData(data);
                    } else {
                        this.props.history.push('/user/review-class');
                    }
                });
            } else {
                this.props.history.push('/user/review-class');
            }
        });
    }

    // saveInfo = () => {
    //     const reviewClass = this.props.reviewClass ? this.props.reviewClass.item || {} : {};
    //     console.log(this.props.reviewClass);
    //     if (reviewClass) {
    //         const changes = {
    //             title: this.name.value().trim(),
    //             students: this.students.value(),
    //             teacher: this.teacher.value(),
    //             dateStart: this.dateStart.value(),
    //             dateEnd: this.dateEnd.value(),
    //         };
    //         if (changes.title == '') {
    //             T.notify('Tên lớp học trống!', 'danger');
    //             this.name.focus();
    //         } else {
    //             this.props.updateReviewClass(reviewClass._id, changes);
    //         }
    //     }
    // }

    deleteStudent = (e, student) => e.preventDefault() || T.confirm('Xóa học viên', `Bạn có chắc bạn muốn xóa học viên <strong>${student.lastname + ' ' + student.firstname}</strong>?`, true, isConfirm =>
        {
            const verificationImage = this.props.verificationImage ? this.props.verificationImage.item || {} : {};
            isConfirm && this.props.deleteStudentVerificationImage(verificationImage._id, student._id);
        }
    );

    render() {
        const verificationImage = this.props.verificationImage ? this.props.verificationImage.item || {} : {},
        permission = this.getUserPermission('verificationImage');
        const previousRoute = '/user/review-class';
        const table = renderTable({
            getDataSource: () => verificationImage && verificationImage.students ? verificationImage.students : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} url={'/user/review-class/' + item._id}/>
                    <TableCell type='text' content={item.user && item.user.phoneNumber}   />
                    <TableCell type='buttons' permission={permission} content={item}  onDelete={this.deleteStudent} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-tasks',
            title: 'Thông tin lớp: ' + verificationImage.title,
            breadcrumb: [<Link key={0} to='/user/review-class'>Lớp ôn tập</Link>, 'Thông tin lớp'],
            content: 
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.name = e} label='Tên lớp học' className='col-md-4' value={verificationImage.title} readOnly={true} />
                        <p className='col-md-4'>Thời gian bắt đầu: {T.dateToText(verificationImage.dateStart, 'hh:ss dd/mm/yyyy')}</p>
                        <p className='col-md-4'>Sỉ số lớp: {verificationImage.students ? (verificationImage.students.length + '/' + verificationImage.maxStudent) : '0/' + verificationImage.maxStudent}</p>
                    </div>
                    {table}
                    {/* {!readOnly ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null} */}
                </div>,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, verificationImage: state.training.verificationImage });
const mapActionsToProps = { getVerificationImage, updateVerificationImage, deleteStudentVerificationImage };
export default connect(mapStateToProps, mapActionsToProps)(AdminVerificationImagePage);
