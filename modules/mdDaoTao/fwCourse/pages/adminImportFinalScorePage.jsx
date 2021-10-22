import React from 'react';
import { connect } from 'react-redux';
import { importFinalScore, getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormFileBox, FormTextBox, CirclePageButton } from 'view/component/AdminPage';

class ImportPage extends AdminPage {
    state = { isFileBoxHide: true };

    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/import-final-score').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.setInitialInput(course.subjects);
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            data.item && this.setInitialInput(data.item.subjects);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    setInitialInput = (subjects) => {
        this.startRow.value(8);
        this.idCardCol.value('D');
        // const subjectCols = [];
        subjects.forEach(({ _id }, index) => {
            const col = String.fromCharCode('E'.charCodeAt() + index);
            // subjectCols.push({
            //     subject: _id, col
            // });
            this[_id].value(col);
        });
        // this.setState({ userData: { ...this.state.userData, subjectCols } }, () => console.log(this.state, 'àter'));
    }

    onUploadSuccess = (data) => {
        this.setState(data, () => console.log(this.state, 'fff'));
    }

    onChange = (e) => {
        e.preventDefault();
        const { subjects = [] } = this.props.course.item || {},
            _subjectIds = subjects.map(({ _id }) => _id),
            params = ['startRow', 'endRow', 'idCardCol', ...(subjects.length && _subjectIds)],
            isFileBoxHide = params.some(item => this[item].value() == '');
        this.setState({ isFileBoxHide }, () => {
            if (!this.state.isFileBoxHide) {
                const userData = params.reduce((result, item) => `${result}:${this[item].value()}`, 'FinalScoreFile');
                this.fileBox.setData(userData);
            }
        });
    }

    // setData = () => {
    //     let userData='FinalScoreFile:';
    //     this.fileBox.setData(userData);
    // }


    // edit = (studentId, changes) => {
    //     this.setState(prevState => ({
    //         data: prevState.data.map(data => data.id === studentId ? changes : data)
    //     }));
    // }

    // delete = (e, item) => e.preventDefault() || T.confirm('Xóa thông tin ứng viên', `Bạn có chắc bạn muốn xóa thông tin ứng viên <strong>${item.firstname + ' ' + item.lastname}</strong>?`, true, isConfirm =>
    //     isConfirm && this.setState(prevState => ({
    //         data: prevState.data.filter(data => data.id !== item.id)
    //     }))
    // );

    save = () => {
        if (!this.itemDivision.value()) {
            T.notify('Chưa chọn cơ sở đào tạo!', 'danger');
            this.itemDivision.focus();
        } else if (!this.itemCourseType.value()) {
            T.notify('Chưa chọn loại khóa học!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.importPreStudent(this.state.data, this.itemDivision.value(), this.itemCourseType.value(), data => {
                if (data.error) {
                    T.notify('Import ứng viên bị lỗi!', 'danger');
                } else {
                    this.props.history.push('/user/pre-student');
                }
            });
        }
    }

    render() {
        const { subjects = [], _id = null, name = '...' } = this.props.course.item || {},
            backRoute = `/user/course/${_id}/learning`;
        // const filebox = this.startRow && this.endRow ? (
        //     <div className='tile'>
        //         <h3 className='tile-title'>Nhập điểm thi hết môn bằng Excel</h3>
        //         <FormFileBox ref={e => this.fileBox = e} uploadType='FinalScoreFile' userData={'FinalScoreFile:' + this.startRow.value() + ':' + this.endRow.value()}
        //             onSuccess={this.onUploadSuccess} readOnly={false} />
        //     </div >
        // ) : null;

        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Nhập điểm thi hết môn bằng Excel: ' + name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, ...(_id ? [<Link key={1} to={`/user/course/${_id}`}>{name}</Link>,
            <Link key={2} to={backRoute}>Tiến độ học tập</Link>, 'Nhập điểm thi hết môn bằng Excel'] : [])],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông số đầu vào</h3>
                    <div className="row">
                        <FormTextBox ref={e => this.startRow = e} onChange={e => this.onChange(e)} label='Dòng bắt đầu' className='col-md-4' type='number' />
                        <FormTextBox ref={e => this.endRow = e} onChange={e => this.onChange(e)} label='Dòng kết thúc' className='col-md-4' type='number' />
                        <FormTextBox ref={e => this.idCardCol = e} onChange={e => this.onChange(e)} label='Cột CMND/CCCD' className='col-md-4' />
                    </div>{/* <div className='tile-body' style={{ overflowX: 'auto' }}>
                        {table}
                    </div> */}
                    <div className="row"> {subjects.length ? subjects.map(({ _id, title }, index) => <FormTextBox key={index} ref={e => this[_id] = e} label={'Môn ' + title} className='col-md-3' />) : ''}</div>

                </div>
                <CirclePageButton type='save' onClick={this.save} />
                {!this.state.isFileBoxHide ? <div className='tile'>
                    <h3 className='tile-title'>Nhập điểm thi hết môn bằng Excel</h3>
                    <FormFileBox ref={e => this.fileBox = e} uploadType='FinalScoreFile' onSuccess={this.onUploadSuccess} readOnly={false} />
                </div > : null}
                {/* {this.state.data && this.state.data.length ? list : null} */}
            </>,
            backRoute,
        });
    }
}
const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { importFinalScore, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
