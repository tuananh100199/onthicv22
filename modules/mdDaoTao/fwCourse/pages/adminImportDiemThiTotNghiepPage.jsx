import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgressPage, importScore } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, FormTextBox, FormFileBox, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';
import './style.scss';

class AdminImportDiemThiTotNghiepPage extends AdminPage {
    itemMonThi = {};
    state = { isFileBoxHide: true };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/import-graduation-exam-score').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                this.setState({ courseId: params._id });
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            data.item && this.setDefaultInput(data.item.monThiTotNghiep);
                        }
                    });
                } else {
                    this.setDefaultInput(course.monThiTotNghiep);
                }


            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    setDefaultInput = (monThiTotNghiep) => {
        const listColumn = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
        this.itemStartRow.value(8);
        this.itemIdentityCard.value('C');
        monThiTotNghiep.forEach((monThi, index) => {
            this[monThi._id].value(listColumn[index]);
        });
    }


    change = (e) => {
        e.preventDefault();
        const { monThiTotNghiep } = this.props.course && this.props.course.item,
            monThiTotNghiepIds = monThiTotNghiep.map(({ _id }) => _id),
            params = ['itemStartRow', 'itemEndRow', 'itemIdentityCard', ...(monThiTotNghiep.length && monThiTotNghiepIds)],
            isFileBoxHide = params.some(item => this[item].value() == '');
        this.setState({ isFileBoxHide }, () => {
            if (!this.state.isFileBoxHide) {
                const userData = params.reduce((result, item) => `${result}:${this[item].value()}`, 'DiemThiTotNghiepFile');
                this.fileBox.setData(userData);
            }
        });

    }

    save = () => {
        const { _id } = this.props.course.item || {};
        if (this.state.data) {
            this.props.importScore(this.state.data, _id);
        } else T.notify('Chưa có thông tin điểm thi tốt nghiệp của học viên!', 'danger');
    }



    onUploadSuccess = ({ data }) => {
        console.log(data);
        const { monThiTotNghiep } = this.props.course && this.props.course.item,
            monThiTotNghiepIds = monThiTotNghiep.map(({ _id }) => _id);
        data.length && monThiTotNghiep.length && data.forEach(item => {
            item.diemThiTotNghiep.forEach(item => {
                item.monThiTotNghiep = monThiTotNghiepIds.find(_id => this[_id].value() == item.col);
                delete item.col;
            });
        });
        this.setState({ data });

    }


    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const listMonThi = item && item.monThiTotNghiep;
        const filebox = !this.state.isFileBoxHide && (
            <>
                <h3 className='tile-title'>Import điểm thi tốt nghiệp</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='DiemThiTotNghiepFile'
                    onSuccess={this.onUploadSuccess} r />
            </>
        );
        const componentSetting = (
            <>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.itemStartRow = e} label='Dòng bắt đầu' onChange={e => this.change(e)} />
                    <FormTextBox className='col-md-3' ref={e => this.itemEndRow = e} label='Dòng kết thúc' onChange={e => this.change(e)} />
                    <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='Cột CMND/CCCD' onChange={e => this.change(e)} />
                    {listMonThi && listMonThi.length && listMonThi.map((monThi, index) =>
                        (<FormTextBox key={index} ref={e => this[monThi._id] = e} className='col-md-3' label={'Môn thi: ' + monThi.title} onChange={e => this.change(e)} />)
                    )}
                </div>
            </>);
        const subjectColumns = [];
        (listMonThi || []).forEach(({ title }, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto' }} nowrap='true'>{'Môn ' + title}</th>);
        });
        const table = renderTable({
            getDataSource: () => this.state.data,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Số CMND/CCCD</th>
                    {subjectColumns}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.identityCard} />
                    {item.diemThiTotNghiep.map(({ point }, idx) =>
                        <TableCell type='number' key={idx} style={{ textAlign: 'center' }} content={point} />)}
                </tr>),
        });

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
                {this.state.data && this.state.data.length ? <div className='tile'>
                    <h3 className='tile-title'>Bảng điểm thi hết môn</h3>
                    {table}
                </div> : null}
                <CirclePageButton type='save' onClick={this.save} />
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage, updateStudent, importScore };
export default connect(mapStateToProps, mapActionsToProps)(AdminImportDiemThiTotNghiepPage);