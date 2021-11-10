import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgressPage, importScore } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, FormTextBox, FormFileBox, TableCell, renderTable, FormCheckbox } from 'view/component/AdminPage';
import './style.scss';

class AdminImportDiemThiTotNghiepPage extends AdminPage {
    state = { isFileBoxHide: true, listDiemLiet: [] };
    itemLiet = {};
    // itemLietCol = {};
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
        monThiTotNghiep.length && monThiTotNghiep.forEach((monThi, index) => {
            this[monThi._id].value(listColumn[index]);
            this.itemLiet[monThi._id].value(monThi.diemLiet);
            this.setState(prevState => ({
                listDiemLiet: [...prevState.listDiemLiet, monThi.diemLiet]
            }));
        });
    }


    change = (e) => {
        e && e.preventDefault();
        const { monThiTotNghiep } = this.props.course && this.props.course.item,
            monThiTotNghiepIds = monThiTotNghiep.map(({ _id }) => _id),
            listDiemLiet = this.state.listDiemLiet,
            listDiemLietId = [];
        monThiTotNghiep.forEach((item, index) => {
            listDiemLiet[index] && listDiemLietId.push('Liet' + item._id);
        });
        let params = ['itemStartRow', 'itemEndRow', 'itemIdentityCard', ...(monThiTotNghiep.length && monThiTotNghiepIds)];
        params = params.concat(listDiemLietId);
        const isFileBoxHide = params.some(item => this[item].value() == '');
        this.setState({ isFileBoxHide }, () => {
            if (!this.state.isFileBoxHide) {
                const userData = params.reduce((result, item) => `${result}:${item.startsWith('Liet') ? item + '|' + this[item].value() : this[item].value()}`, 'DiemThiTotNghiepFile');
                this.fileBox.setData(userData);
            }
        });

    }

    changeDiemLiet = (e, index) => {
        this.setState(prevState => {
            prevState.listDiemLiet[index] = e;
            return {
                listDiemLiet: prevState.listDiemLiet
            };
        }, () => {
            this.change();
        });
    }

    onReUpload = (e) => {
        this.setState({ data: [], isFileBoxHide: false });
        this.change(e);
    }


    save = () => {
        const { _id } = this.props.course.item || {};
        if (this.state.data) {
            this.props.importScore(this.state.data, _id);
            this.setState({ data: [], isFileBoxHide: false });
            this.change();
        } else T.notify('Chưa có thông tin điểm thi tốt nghiệp của học viên!', 'danger');
    }



    onUploadSuccess = ({ data }) => {
        const { monThiTotNghiep } = this.props.course && this.props.course.item;
        data.length && monThiTotNghiep.length && data.forEach(item => {
            let totNghiep = true;
            item.diemThiTotNghiep.forEach(diemThi => {
                diemThi.monThiTotNghiep = monThiTotNghiep.find(monThiTotNghiep => this[monThiTotNghiep._id].value() == diemThi.col);
                diemThi.diemLiet = item.diemLiet.indexOf(diemThi.monThiTotNghiep._id) != -1;
                if (diemThi.diemLiet || diemThi.point < diemThi.monThiTotNghiep.score) totNghiep = false;
                delete diemThi.col;
            });
            item.totNghiep = totNghiep;
        });
        this.setState({ data, isFileBoxHide: true });
    }


    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const listMonThi = item && item.monThiTotNghiep;
        const listDiemLiet = this.state.listDiemLiet;
        const filebox = !this.state.isFileBoxHide && (
            <div className='tile'>
                <h3 className='tile-title'>Import điểm thi tốt nghiệp</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='DiemThiTotNghiepFile'
                    onSuccess={this.onUploadSuccess} r />
            </div>
        );
        const componentSetting = (
            <>
                <h3 className='tile-title'>Thông số đầu vào</h3>
                <div className='row'>
                    <FormTextBox className='col-md-3' ref={e => this.itemStartRow = e} label='Dòng bắt đầu' onChange={e => this.change(e)} type='number' />
                    <FormTextBox className='col-md-3' ref={e => this.itemEndRow = e} label='Dòng kết thúc' onChange={e => this.change(e)} type='number' />
                    <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='Cột CMND/CCCD' onChange={e => this.change(e)} />
                    <h3 className='tile-title col-12'>Danh sách các cột môn thi</h3>
                    {listMonThi && listMonThi.length ? listMonThi.map((monThi, index) =>
                    (
                        <div key={index} className='col-md-3'>
                            <FormTextBox ref={e => this[monThi._id] = e} label={'Môn thi: ' + monThi.title} onChange={e => this.change(e)} />
                            <FormCheckbox ref={e => this.itemLiet[monThi._id] = e} label={'Điểm liệt: ' + monThi.title} onChange={e => this.changeDiemLiet(e, index)} />
                            {listDiemLiet && listDiemLiet[index] && <FormTextBox ref={e => this['Liet' + monThi._id] = e} label={'Điểm liệt: ' + monThi.title} onChange={e => this.change(e)} />}
                        </div>

                    )
                    ) : null}
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
                    {item.diemThiTotNghiep.map(({ point, diemLiet }, idx) =>
                        <TableCell type='number' key={idx} style={{ textAlign: 'center' }} className={diemLiet ? 'text-danger' : ''} content={point} />)}
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
                    </div>
                </div>
                {filebox}
                {this.state.data && this.state.data.length ? <div className='tile'>
                    <h3 className='tile-title'>Danh sách điểm thi tốt nghiệp của học viên</h3>
                    {table}
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-danger' type='button' style={{ marginRight: 10 }} onClick={this.onReUpload}>
                            <i className='fa fa-fw fa-lg fa-cloud-upload' /> Upload lại
                        </button>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>
                    : null}
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage, updateStudent, importScore };
export default connect(mapStateToProps, mapActionsToProps)(AdminImportDiemThiTotNghiepPage);