import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { getRandomSubjectTest, getSubject, updateSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable,CirclePageButton } from 'view/component/AdminPage';

class AdminFinalExamPage extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/final-exam-setting/:_subjectId').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getSubject(params._subjectId, subject => {
                                const finalQuestions = subject.item.finalQuestions;
                                this.props.getRandomSubjectTest(params._subjectId, (data) => {
                                    if(finalQuestions && finalQuestions.length) {
                                        data.forEach(question => {
                                            if(finalQuestions.findIndex(item => item == question._id) != -1)
                                                question.activeFinalExam = true;
                                            else question.activeFinalExam = false;
                                        });
                                    } else {
                                        data.forEach(question => {
                                            question.activeFinalExam = true;
                                        });
                                    }
                                    this.setState({ courseId: params._id, listQuestion: data, subject: subject.item, finalQuestions: finalQuestions });
                                });
                            });
                        }
                    });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getSubject(params._subjectId, subject => {
                                const finalQuestions = subject.item.finalQuestions;
                                this.props.getRandomSubjectTest(params._subjectId, (data) => {
                                    if(finalQuestions && finalQuestions.length) {
                                        data.forEach(question => {
                                            if(finalQuestions.findIndex(item => item == question._id) != -1)
                                                question.activeFinalExam = true;
                                            else question.activeFinalExam = false;
                                        });
                                    } else {
                                        data.forEach(question => {
                                            question.activeFinalExam = true;
                                        });
                                    }
                                    this.setState({ courseId: params._id, listQuestion: data, subject: subject.item, finalQuestions: finalQuestions });
                                });
                            });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    save = () => {
        const subject = this.state.subject;
        const listQuestion = this.state.listQuestion ? this.state.listQuestion : [];
        let finalQuestions = [];
        listQuestion.forEach(item => {
            if(item.activeFinalExam == 1) finalQuestions.push(item._id);
        });
        if(finalQuestions.length < 10) 
            T.notify('Chưa đủ câu hỏi yêu cầu!', 'danger');
        else this.props.updateSubject(subject._id, { finalQuestions });
    }

    change = (active, _id) => {
        const listQuestion = this.state.listQuestion;
        listQuestion[listQuestion.findIndex(item => item._id == _id)].activeFinalExam = active;
        this.setState({ listQuestion });
    }

    render() {
        const permission = this.getUserPermission('course');
        const course = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] };
        const listQuestion = this.state.listQuestion ? this.state.listQuestion : [];
        const { subject} = this.state;
        const backRoute = `/user/course/${course._id}/final-exam-setting`;
        const table = renderTable({
            getDataSource: () => listQuestion ,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }}>Câu hỏi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.title} />
                    <TableCell type='checkbox' permission={permission} content={item.activeFinalExam} onChanged={active => this.change(active, item._id)} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-sliders',
            title: 'Thiết lập thi hết môn: ' + (subject && subject.title ? subject.title : ''),
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={`/user/course/${course._id}`}>{course.name}</Link> : '', <Link key={0} to={backRoute}>{'Thiết lập thi hết môn'}</Link> ,subject && subject.title ?  subject.title : ''],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                    <CirclePageButton type='save' onClick={this.save}/>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getRandomSubjectTest, getSubject, updateSubject };
export default connect(mapStateToProps, mapActionsToProps)(AdminFinalExamPage);
