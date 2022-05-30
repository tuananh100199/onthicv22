import React from 'react';
import { connect } from 'react-redux';
import { getReviewClass, updateReviewClass } from './redux';
import {ajaxSelectTeacherByCourseType} from 'modules/_default/fwTeacher/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, CirclePageButton, TableCell, renderTable, } from 'view/component/AdminPage';

class AdminReviewClassPage extends AdminPage {
    state = {};
    componentDidMount() {

        const setData = (data) => {
            const { title, students, teacher, dateStart, dateEnd} = data;

            this.name.value(title);
            this.student.value(students);
            this.teacher.value(teacher);
            this.dateStart.value(dateStart);
            this.dateEnd.value(dateEnd);
        };

        T.ready('/user/review-class', () => {
            const params = T.routeMatcher('/user/review-class/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getReviewClass(params._id, data => {
                    console.log(data);
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

    saveInfo = () => {
        const reviewClass = this.props.reviewClass ? this.props.reviewClass.item || {} : {};
        if (reviewClass) {
            const changes = {
                title: this.name.value().trim(),
                students: this.students.value(),
                teacher: this.teacher.value(),
                dateStart: this.dateStart.value(),
                dateEnd: this.dateEnd.value(),
            };
            if (changes.title == '') {
                T.notify('Tên lớp học trống!', 'danger');
                this.name.focus();
            } else {
                this.props.updateReviewClass(reviewClass._id, changes);
            }
        }
    }

    render() {
        const reviewClass = this.props.reviewClass ? this.props.reviewClass.item || {} : {},
        readOnly = false;
        const previousRoute = '/user/review-class';
        const table = renderTable({
            getDataSource: () => reviewClass && reviewClass.students ? reviewClass.students : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.title} url={'/user/review-class/' + item._id}/>
                    <TableCell type='text' content={item.dateStart ? T.dateToText(item.dateStart, 'dd/mm/yyyy') : ''}   />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-tasks',
            title: 'Thông tin lớp: ' + reviewClass.title,
            breadcrumb: [<Link key={0} to='/user/review-class'>Lớp ôn tập</Link>, 'Thông tin lớp'],
            content: 
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.name = e} label='Tên lớp học' className='col-md-4' value={reviewClass.title} readOnly={readOnly} />
                        <FormSelect ref={e => this.teacher = e} label='Giáo viên' data={ajaxSelectTeacherByCourseType} className='col-md-4' readOnly={readOnly} />
                        {table}
                        {!readOnly ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
            </div>
                </div>,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, reviewClass: state.trainning.reviewClass });
const mapActionsToProps = { getReviewClass, updateReviewClass };
export default connect(mapStateToProps, mapActionsToProps)(AdminReviewClassPage);
