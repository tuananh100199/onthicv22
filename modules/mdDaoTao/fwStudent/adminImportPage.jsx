import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormFileBox, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';

class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = {};
    onUploadSuccess = (data) => {
        this.setState(data);
    }
    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        const table = renderTable({
            getDataSource: () => this.state.data ? this.state.data : [],
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Họ và Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: '20%' }}>Di động</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đăng ký</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={item.numberic} />
                    <TableCell type='link' content={item.firstname + ' ' + item.lastname} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='text' content={T.mobileDisplay(item.phoneNumber)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên: ',
            breadcrumb: ['Ứng viên'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Upload danh sách ứng viên</h3>
                    <FormFileBox ref={e => this.fileBox = e} className='col-md-3' label='File excel ứng viên' uploadType='CandidateFile'
                        onSuccess={this.onUploadSuccess} />
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Danh sách ứng viên</h3>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <CirclePageButton type='save' onClick={() => alert('todo')} />
            </>,
            backRoute: '/user/pre-student',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
export default connect(mapStateToProps)(ImportPage);
