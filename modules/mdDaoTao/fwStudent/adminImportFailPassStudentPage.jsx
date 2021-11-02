import React from 'react';
import { connect } from 'react-redux';
import { importFailPassStudent, downloadFailPassStudentFile } from './redux';
import { Link } from 'react-router-dom';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, FormSelect, FormFileBox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

const importTypes = [
    { id: 0, text: 'Đạt' },
    { id: 1, text: 'Chưa đạt' },
    { id: 2, text: 'Vắng thi' },
];

class ImportPage extends AdminPage {
    state = { isFileBoxHide: true };

    componentDidMount() {
        T.ready('/user/student/fail-exam', () => {
            this.setInitialInput();
        });
    }

    setInitialInput = () => {
        this.startRow.value(16);
        this.endRow.value(parseInt(this.startRow.value()));
        this.fullnameCol.value('D');
        this.birthdayCol.value('E');
        this.courseCol.value('J');
        this.courseTypeCol.value('K');
        this.importType.value(1);
        this.idCardCol.value('N');
    }

    onUploadSuccess = ({ data, fileName, notify }) => {
        if (fileName) { // map not 100%
           downloadFailPassStudentFile();
            // window.open('/api/student/download-fail-pass');// browser allow popup !
        } else if (data && data.length > 0) {
            this.setState({ data, isFileBoxHide: true });
        }
        T.notify(notify, 'success');
    }

    onChangeCourseType = (courseTypeName) => {
        this.setState({ courseTypeName });
    }

    onChange = (e, text = undefined) => {
        e && e.preventDefault();
        if (text) {
            this.onChangeCourseType(text);
        }
        const params = ['startRow', 'endRow', 'fullnameCol', 'birthdayCol', 'courseCol', 'courseTypeCol', 'courseType', 'idCardCol'],
            isFileBoxHide = params.some(item => [null, ''].includes(this[item].value()));
        this.setState({ isFileBoxHide }, () => {
            if (!this.state.isFileBoxHide) {
                const userData = params.reduce((result, item) => `${result}:${item == 'courseType' ? this.state.courseTypeName : this[item].value()}`, 'FailPassStudentFile');
                this.fileBox.setData(userData);
            }
        });
    }

    onReUpload = (e) => {
        this.setState({ data: [], isFileBoxHide: false });
        this.onChange(e);
    }

    save = () => {
        if (this.state.data && this.state.data.length > 0) {
            this.props.importFailPassStudent(this.state.data.map(({ identityCard, course }) => ({ identityCard, course })), this.importType.value(), () => this.setState({ data: [], isFileBoxHide: false }));
        } else T.notify('Chưa có thông tin học viên!', 'danger');
    }

    render() {
        const backRoute = '/user/student/fail-exam';
        const table = renderTable({
            getDataSource: () => this.state.data,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }} nowrap='true'>Họ và tên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số CMND/CCCD</th>
                    <th style={{ width: '30%' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: '30%' }} nowrap='true'>Khóa học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.fullname} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.identityCard} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={typeof item.birthday == 'object' ? T.dateToText(item.birthday) : item.birthday} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.courseName} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Nhập học viên đạt/chưa đạt sát hạch bằng Excel ',
            breadcrumb: [<Link key={0} to='/user/student/fail-exam'>Học viên chưa đạt sát hạch</Link>, 'Nhập học viên đạt/chưa đạt sát hạch bằng Excel'],
            content: <>
                < div className='tile' style={{ ...(this.state.data && this.state.data.length > 0 && { display: 'none' }) }}>
                    <h3 className='tile-title'>Thông số đầu vào</h3>
                    <div className='row'>
                        <FormSelect ref={e => this.courseType = e} data={ajaxSelectCourseType} label='Loại khóa học'
                            onChange={data => this.onChange(undefined, data.text)} className='col-md-6' />
                        <FormSelect ref={e => this.importType = e} label='Loại file tải lên' data={importTypes} className='col-md-6' />
                        <FormTextBox ref={e => this.startRow = e} onChange={e => this.onChange(e)} label='Dòng bắt đầu' className='col-md-6' type='number' min={2} max={this.endRow ? parseInt(this.endRow.value()) : ''} />
                        <FormTextBox ref={e => this.endRow = e} onChange={e => this.onChange(e)} label='Dòng kết thúc' className='col-md-6' type='number' min={this.startRow ? parseInt(this.startRow.value()) : ''} />
                        <FormTextBox ref={e => this.fullnameCol = e} onChange={e => this.onChange(e)} label='Cột Họ và tên' className='col-md-4' />
                        <FormTextBox ref={e => this.birthdayCol = e} onChange={e => this.onChange(e)} label='Cột Ngày sinh' className='col-md-4' />
                        <FormTextBox ref={e => this.courseCol = e} onChange={e => this.onChange(e)} label='Cột Khóa học' className='col-md-4' />
                        <FormTextBox ref={e => this.courseTypeCol = e} onChange={e => this.onChange(e)} label='Cột Loại khóa học' className='col-md-4' />
                        <FormTextBox ref={e => this.idCardCol = e} onChange={e => this.onChange(e)} label='Cột CMND/CCCD' className='col-md-4' />
                    </div>
                </div>
                {this.state.data && this.state.data.length > 0 ? <div className='tile'>
                    <h3 className='tile-title'>{`Danh sách học viên ${importTypes[parseInt(this.importType.value())].text} sát hạch của loại khóa học ${this.state.courseTypeName} `}</h3>
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
                    <h3 className='tile-title'>Nhập học viên đạt/chưa đạt sát hạch bằng Excel</h3>
                    <FormFileBox readOnly={false} ref={e => this.fileBox = e} uploadType='FailPassStudentFile' onSuccess={this.onUploadSuccess} />
                </div > : null}
            </>,
            backRoute,
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { importFailPassStudent };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);
