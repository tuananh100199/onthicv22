import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIcon } from 'view/component/AdminPage';
import RateModal from 'modules/_default/fwRate/RateModal';
import { getRateByUser } from 'modules/_default/fwRate/redux';

class LecturerStudentPage extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/tien-do-hoc-tap'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    this.setState({ data });
                    if (data.teacher) {
                        this.props.getRateByUser('teacher', data.teacher._id);
                    }
                });
            });
        } else {
            this.props.history.goBack();
        }
    }

    checkLyThuyet = (student, subjects) => { 
        const tienDoThiHetMon = student && student.tienDoThiHetMon;
        let numOfCompleteSubject = 0;
        if(tienDoThiHetMon){
            Object.keys(tienDoThiHetMon).forEach(subject =>{
                if(tienDoThiHetMon[subject].diemTB >= 0.5) numOfCompleteSubject ++;
            });
        }
        return subjects.length ? Number(numOfCompleteSubject / subjects.length).toFixed(1) * 100 : 0;
    }

    checkMonLyThuyet = (student, subject) => {
        const tienDoThiHetMon = student && student.tienDoThiHetMon;
        const result = tienDoThiHetMon && tienDoThiHetMon[subject._id] && tienDoThiHetMon[subject._id].score && parseInt(tienDoThiHetMon[subject._id].score) >= 5;
        return result;
    }

    checkTienDoHocTap = (student, subject) => {
        let completedLessons = 0;
        const numberLessons = subject && subject.lessons ? subject.lessons.length : 0;
        if (subject && student.tienDoHocTap && student.tienDoHocTap[subject._id]) {
            completedLessons = (Object.keys(student.tienDoHocTap[subject._id]).length > numberLessons ?
                numberLessons :
                Object.keys(student.tienDoHocTap[subject._id]).length);
        }
        return Number(completedLessons / numberLessons).toFixed(1) * 100;
    }

    checkTienDoHocThucHanh = (student, subject) => {
        let completedLessons = 0;
        const numberLessons = subject && subject.lessons ? subject.lessons.length : 0;
        if (subject && student.tienDoHocTap && student.tienDoHocTap[subject._id]) {
            const lessons = student.tienDoHocTap[subject._id];
            completedLessons = subject.lessons && subject.lessons.length?subject.lessons.reduce((result,item)=>{
                return lessons[item] && lessons[item].isPass && lessons[item].isPass=='true'?result+1:result;
            },0):0;
        }
        return (completedLessons==0||numberLessons==0)?0:Number(completedLessons / numberLessons).toFixed(1) * 100;
    }

    checkThucHanh = (student, subjects) => {
        let completedLessons = 0,numberLessons = 0;
        subjects.forEach(subject=>{
            const lessons = subject.lessons && subject.lessons.length ?subject.lessons:[];
            if(lessons.length){
                numberLessons+=lessons.length;
                if(student.tienDoHocTap && student.tienDoHocTap[subject._id]){
                    const tienDoBaiHoc = student.tienDoHocTap[subject._id];
                    completedLessons+= lessons.reduce((result,item)=>{
                        return tienDoBaiHoc[item] && tienDoBaiHoc[item].isPass && tienDoBaiHoc[item].isPass=='true'?result+1:result;
                    },0);
                }
            }
        });
        return (completedLessons==0||numberLessons==0)?0:Number(completedLessons / numberLessons).toFixed(1) * 100;
    }

    checkHocPhi = (student) => {
        const giamGia = student && student.discount && student.discount.fee ? student.discount.fee : 0;
        const hocPhi = student && student.courseFee && student.courseFee.fee ? student.courseFee.fee - giamGia : 0;
        const hocPhiDaDong = student &&  student.lichSuDongTien && student.lichSuDongTien.length ? student.lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
        if(hocPhi){
            return Number(hocPhiDaDong / hocPhi).toFixed(1) * 100;
        } return 100;
    }

    renderSubject = (student, subjects, i, showMonLyThuyet) => {
        if(subjects && subjects[i]) 
        return (<PageIcon to={showMonLyThuyet ? '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + subjects[i]._id : '#'} icon='fa-book' className={'col-md-4 mon' + i} subtitle={
            <>
                 <div className='progress'>
                    <div className={'progress-bar progress-bar-striped progress-bar-animated ' + (this.checkTienDoHocTap(student, subjects[i]) == 100 ? 'bg-success' : '')} role='progressbar' style={{width: this.checkTienDoHocTap(student,subjects[i]) + '%'}} aria-valuenow={this.checkTienDoHocTap(student,subjects[i])} aria-valuemin='0' aria-valuemax='100'></div>
                </div>
                <p>{this.checkTienDoHocTap(student, subjects[i]) < 100 ? null : (this.checkMonLyThuyet(student, subjects[i]) ? 'Thi hết môn: Đạt' : 'Thi hết môn: Chưa đạt')}</p>
            </>
      } iconBackgroundColor={showMonLyThuyet ? '#17a2b8' : 'gray'} text={subjects[i].title && subjects[i].title.startsWith('Đạo đức') ? 'Đạo đức lái xe' : subjects[i].title}/>);
      else return null;
    }

    renderPracticalSubject = (student,subject, showMonThucHanh)=>{
        if(subject){
            return (<PageIcon key={student._id} onClick={() => !showMonThucHanh ? T.alert('Vui lòng hoàn thành hai môn học: Pháp luật giao thông đường bộ và Kỹ thuật lái xe để mở khóa!', 'error', false, 8000) : null} to={!showMonThucHanh ? '#' : '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + subject._id} icon='fa-book' className={'col-12'} subtitle={
                <>
                     <div className='progress'>
                        <div className={'progress-bar progress-bar-striped progress-bar-animated ' + (this.checkTienDoHocThucHanh(student, subject) == 100 ? 'bg-success' : '')} role='progressbar' style={{width: this.checkTienDoHocThucHanh(student,subject) + '%'}} aria-valuenow={this.checkTienDoHocThucHanh(student,subject)} aria-valuemin='0' aria-valuemax='100'></div>
                    </div>
                </>
          } iconBackgroundColor={showMonThucHanh ? '#17a2b8' : 'gray'} text={subject.title}/>);
        }else{
            return null;
        }
    }

    renderHoSo = (student) => {
        let text = '',
        hoSoConThieu = [];
        if(student.isDon && student.isHinh && student.isIdentityCard && student.isGiayKhamSucKhoe && student.isBangLaiA1) text = 'Đã hoàn thành';
        else {
            text = 'Còn thiếu:';
            if(!student.isDon) hoSoConThieu.push(' đơn');
            if(!student.isHinh) hoSoConThieu.push(' hình');
            if(!student.isIdentityCard) hoSoConThieu.push(' CMND');
            if(!student.isGiayKhamSucKhoe) hoSoConThieu.push(' giấy khám sức khoẻ');
            if(!student.isBangLaiA1) hoSoConThieu.push(' bằng lái A1');
            text = text + hoSoConThieu.toString();
        }
        return text;
    }

    onHandleRatingTeacher = (e,rate,showDanhGia)=>{
        e.preventDefault();
        if(!showDanhGia) T.alert('Bạn phải hoàn thành khóa học để thực hiện đánh giá', 'error', false, 2000);
        else if(rate) T.alert('Bạn đã thực hiện đánh giá rồi!', 'error', false, 2000);
        else{
            this.modal.show();
        }
    }

    render() {
        const course = this.props.course;
        const subjects = course && course.item && course.item.subjects;
        const student = course && course.student;
        const monLyThuyet = subjects ? subjects.filter(subject => subject.monThucHanh == false) : [];
        const monThucHanh = subjects ? subjects.filter(subject => subject.monThucHanh == true) : [];
        const subjectColumns = [];
        const giamGia = student && student.discount && student.discount.fee ? student.discount.fee : 0;
        const hocPhi = student && student.courseFee && student.courseFee.fee ? student.courseFee.fee - giamGia : 0;
        const hocPhiDaDong = student &&  student.lichSuDongTien && student.lichSuDongTien.length ? student.lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
        (monLyThuyet || []).forEach((subject, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto', textAlign: 'center' }}  >{subject.title}</th>);
        });
        const showMonLyThuyet = parseInt(hocPhiDaDong)/parseInt(hocPhi) > 0.5;
        const showMonThucHanh = subjects && subjects.length && student && student.tienDoThiHetMon && (subjects.findIndex(subject => (subject.monTienQuyet == true && !student.tienDoThiHetMon[subject._id])) == -1);
        const teacher = this.state.data && this.state.data.teacher ? this.state.data.teacher:null;
        const showDanhGiaGiaoVien = student && student.datSatHach;
        const rate = this.props.rate.item && this.props.rate.item.value;
        
        const pageIcon = 
        student ? 
        <>
        <div className='line'>
            <div className='row justify-content-between hoso'>
                <PageIcon className='col-md-4' icon='fa-info' subtitle={
                    <p>
                        {this.renderHoSo(student)}
                    </p>
                } iconBackgroundColor={(student.isDon && student.isHinh && student.isIdentityCard && student.isGiayKhamSucKhoe && student.isBangLaiA1) ? '#8A0' : 'gray'} text={'Hồ sơ học viên'} />
                {this.renderSubject(student, monLyThuyet, 0, showMonLyThuyet)}
            </div>
            <div className='row justify-content-end'>
                {this.renderSubject(student, monLyThuyet, 1, showMonLyThuyet)}
            </div>
            <div className='row'>
                <PageIcon to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/cong-no'} className='col-md-4 hocphi' icon='fa-money' subtitle={
                    <>
                    <div className='progress'>
                       <div className={'progress-bar progress-bar-striped progress-bar-animated ' + (this.checkHocPhi(student) == 100 ? 'bg-success' : '')} role='progressbar' style={{width: this.checkHocPhi(student) + '%'}} aria-valuenow={this.checkHocPhi(student)} aria-valuemin='0' aria-valuemax='100'></div>
                   </div>
                   {T.numberDisplay(parseInt(hocPhi)-parseInt(hocPhiDaDong)) > 0 ? <p>Còn lại: {T.numberDisplay(parseInt(hocPhi)-parseInt(hocPhiDaDong))} đồng</p> : <p>Đã hoàn thành</p>}
                   </> 
                } iconBackgroundColor={'#64b5f6'} text={'Học phí'} />
              <PageIcon className='col-md-4 lythuyet' icon='fa-briefcase' subtitle={
                    <>
                    <div className='progress'>
                       <div className={'progress-bar progress-bar-striped progress-bar-animated ' + (this.checkLyThuyet(student, subjects) == 100 ? 'bg-success' : '')} 
                            role='progressbar' style={{width: this.checkLyThuyet(student, subjects) + '%'}} 
                            aria-valuenow={this.checkMonLyThuyet(student, subjects)} aria-valuemin='0' aria-valuemax='100'>
                        </div>
                   </div>
                   </> 
              } iconBackgroundColor={hocPhi ? (parseInt(hocPhiDaDong)/parseInt(hocPhi) < 0.5 ? 'gray' : '#dc143c') : '#dc143c'} text={'Lý thuyết'} />
              {this.renderSubject(student, monLyThuyet, 2, showMonLyThuyet)}
            </div>
            <div className='row justify-content-end'>
                {this.renderSubject(student, monLyThuyet, 3, showMonLyThuyet)}
            </div>
            <div className='row justify-content-end'>
                {this.renderSubject(student, monLyThuyet, 4, showMonLyThuyet)}
            </div>
            <div className='row justify-content-start'>
                <PageIcon icon='fa-car' to={'#'} className='col-md-4' subtitle={
                    <div className='progress'>
                        <div className={'progress-bar progress-bar-striped progress-bar-animated ' + (this.checkHocPhi(student) == 100 ? 'bg-success' : '')} role='progressbar' style={{width: this.checkThucHanh(student,monThucHanh) + '%'}} aria-valuenow={this.checkHocPhi(student)} aria-valuemin='0' aria-valuemax='100'></div>
                    </div>
                    // <p>
                    //     {(student.diemThucHanh && student.diemThucHanh >= 5) ? 'Đạt' : 'Chưa đạt'}
                    // </p>
                } iconBackgroundColor={hocPhi ? (parseInt(hocPhiDaDong)/parseInt(hocPhi) < 1 ? 'gray' : '#69f0ae') : '#69f0ae'} text={'Thực hành'}/>
                <div className="col-md-4">
                    <div className="row">
                    {monThucHanh && monThucHanh.map(item=>this.renderPracticalSubject(student,item, showMonThucHanh))}
                    </div>
                </div>
            </div>
            <div className='row'>
                <PageIcon className='col-md-4' to={'#'} icon='fa-graduation-cap' subtitle={
                    <p>
                        Thời gian thi dự kiến: {course && course.item && course.item.thoiGianThiTotNghiepDuKien ? T.dateToText(course.item.thoiGianThiTotNghiepDuKien, 'dd/mm/yyyy') : ''}<br />
                        {(student.totNghiep) ? 'Đạt' : 'Chưa đạt'}
                    </p>
                } iconBackgroundColor='#64b5f6' text={'Thi tốt nghiệp'} />
                <PageIcon className='col-md-4' to={'#'} icon='fa-pencil-square-o' subtitle={
                    <p>
                        Thời gian thi dự kiến: {course && course.item && course.item.thoiGianThiSatHachDuKien ? T.dateToText(course.item.thoiGianThiSatHachDuKien, 'dd/mm/yyyy') : ''}<br />
                        {(student.datSatHach) ? 'Đạt' : 'Chưa đạt'}
                    </p>
                } iconBackgroundColor='#18ffff' text={'Thi sát hạch'} />
                <PageIcon className='col-md-4' to={'#'} icon='fa-star' iconBackgroundColor={ showDanhGiaGiaoVien ? 'orange':'secondary'} text='Đánh giá giáo viên' visible={teacher != null}
                        onClick={(e) => this.onHandleRatingTeacher(e,rate,showDanhGiaGiaoVien)} subtitle={rate ? rate + ' sao' : 'Chưa đánh giá'} />
                
                <PageIcon className='col-md-4' to={'#'} icon='fa-id-card' subtitle={
                    <p>
                        {(student.isLicense) ? 'Đã có tại trung tâm' : 'Chưa có'}
                    </p>
                } iconBackgroundColor='#1488db' text={'Nhận GPLX'} />
            </div>
        </div>
        </>
         : null;

        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Tiến độ học tập: ',
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Tiến độ học tập'],
            content: (
                <div>
                    {pageIcon}
                    {teacher && <RateModal ref={e => this.modal = e} title='Đánh giá giáo viên' type='teacher' _refId={teacher._id} />}
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, rate: state.framework.rate });
const mapActionsToProps = { getCourseByStudent, getRateByUser };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);