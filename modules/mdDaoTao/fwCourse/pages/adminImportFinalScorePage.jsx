import React from 'react';
import { connect } from 'react-redux';
import { importFinalScore, getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormFileBox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

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
        this.endRow.focus();
        this.idCardCol.value('D');
        subjects.forEach(({ _id }, index) => {
            const col = String.fromCharCode('E'.charCodeAt() + index);
            this[_id].value(col);
        });
    }

    onUploadSuccess = ({ data, notify }) => {
        T.notify(notify, 'success');
        const { subjects = [] } = this.props.course.item || {}, numOfSubject = subjects.length,
            _subjectIds = subjects.map(({ _id }) => _id);
        data.length > 0 && numOfSubject > 0 && data.forEach(item => {
            item.diemThiHetMon.forEach(item => {
                item.subject = _subjectIds.find(_id => this[_id].value() == item.col);
                delete item.col;
            });
            item.diemTrungBinhThiHetMon = parseFloat(item.diemThiHetMon.reduce((res, { point }) => point / numOfSubject + res, 0).toFixed(1));
        }
        );
        this.setState({ data, isFileBoxHide: true });
    }

    onChange = (e) => {
        e.preventDefault();
        const { subjects = [] } = this.props.course.item || {},
            _subjectIds = subjects.map(({ _id }) => _id),
            params = ['startRow', 'endRow', 'idCardCol', ...(subjects.length > 0 && _subjectIds)],
            isFileBoxHide = params.some(item => this[item].value() == '');
        this.setState({ isFileBoxHide }, () => {
            if (!this.state.isFileBoxHide) {
                const userData = params.reduce((result, item) => `${result}:${this[item].value()}`, 'FinalScoreFile');
                this.fileBox.setData(userData);
            }
        });
    }

    onReUpload = (e) => {
        this.setState({ data: [], isFileBoxHide: false });
        this.onChange(e);
    }

    save = () => {
        const { _id } = this.props.course.item || {};
        if (this.state.data) {
            this.props.importFinalScore(this.state.data, _id, () => this.setState({ data: [], isFileBoxHide: false }));
        } else T.notify('Chưa có thông tin điểm thi hết môn của học viên!', 'danger');
    }

    render() {
        const { subjects = [], _id = null, name = '...' } = this.props.course.item || {},
            backRoute = `/user/course/${_id}/learning`;
        const subjectColumns = [];
        (subjects || []).forEach(({ title }, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto' }} nowrap='true'>{'Môn ' + title}</th>);
        });
        const table = renderTable({
            getDataSource: () => this.state.data,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Số CMND/CCCD</th>
                    {subjectColumns}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Điểm trung bình</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.identityCard} />
                    {item.diemThiHetMon.map(({ point }, idx) =>
                        <TableCell type='number' key={idx} style={{ textAlign: 'center' }} content={point} />)}
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.diemTrungBinhThiHetMon} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Nhập điểm thi hết môn bằng Excel: ' + name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, ...(_id ? [<Link key={1} to={`/user/course/${_id}`}>{name}</Link>,
            <Link key={2} to={backRoute}>Tiến độ học tập</Link>, 'Nhập điểm thi hết môn bằng Excel'] : [])],
            content: <>
                <div className='tile' style={{ display: this.state.data && this.state.data.length > 0 ? 'none':'block' }}>
                    <h3 className='tile-title'>Thông số đầu vào</h3>
                    <div className='row'>
                        <FormTextBox ref={e => this.startRow = e} onChange={e => this.onChange(e)} label='Dòng bắt đầu' className='col-md-4' type='number' min={2} max={this.endRow ? parseInt(this.endRow.value()) : ''} />
                        <FormTextBox ref={e => this.endRow = e} onChange={e => this.onChange(e)} label='Dòng kết thúc' className='col-md-4' type='number' min={this.startRow ? parseInt(this.startRow.value()) : ''} />
                        <FormTextBox ref={e => this.idCardCol = e} onChange={e => this.onChange(e)} label='Cột CMND/CCCD' className='col-md-4' />
                        <h3 className='tile-title col-12'>Danh sách các cột môn học</h3>
                        {subjects.length > 0 ? subjects.map(({ _id, title }, index) => <FormTextBox key={index} ref={e => this[_id] = e} onChange={e => this.onChange(e)} label={'Môn ' + title} className='col-md-3' />) : ''}
                    </div>
                </div>
                {this.state.data && this.state.data.length>0 ? <div className='tile'>
                    <h3 className='tile-title'>Danh sách điểm thi hết môn của học viên</h3>
                    {table}
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-danger' type='button' style={{ marginRight: 10 }} onClick={this.onReUpload}>
                            <i className='fa fa-fw fa-lg fa-cloud-upload' /> Upload lại
                                    </button>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                    </div>
                </div> : null}
                {!this.state.isFileBoxHide ? <div className='tile'>
                    <h3 className='tile-title'>Nhập điểm thi hết môn bằng Excel</h3>
                    <FormFileBox ref={e => this.fileBox = e} uploadType='FinalScoreFile' onSuccess={this.onUploadSuccess} readOnly={false} />
                </div > : null}
            </>,
            backRoute,
        });
    }
}
const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { importFinalScore, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
