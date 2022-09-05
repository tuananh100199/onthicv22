import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, renderTable,TableCell,CirclePageButton } from 'view/component/AdminPage';
import { getBackupFileAll, deleteBackupFile, createBackupFile, downloadBackupFile, restoreBackupFile } from '../redux';

const  bytesToSize = (bytes)=> {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};
class BackupFilePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/backup', () => {
            this.props.getBackupFileAll();
        });
    }

    
    deleteBackupFile = (e, item) => e.preventDefault() || T.confirm('Xóa backup', `Bạn có chắc bạn muốn xóa backup ${item.filename}?`, true,
        isConfirm => isConfirm && this.props.deleteBackupFile(item.filename));

    downloadBackup = (e,item)=>{
        e.preventDefault();
        this.props.downloadBackupFile(item.filename, () => {
            T.notify('Tải backup thành công!', 'success');
        });
    }

    restoreBackup = (e, item) => e.preventDefault() || T.confirm('Restore dữ liệu', `Bạn có chắc bạn muốn restore lại dữ liệu theo bản ${item.filename}?`, true,
    isConfirm => isConfirm && this.props.restoreBackupFile(item.filename));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.backup && this.props.backup.files && this.props.backup.files.length && this.props.backup.files.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%', textAlign: 'center' }}>File</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Dung lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.filename} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={bytesToSize(item.size)} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={this.deleteBackupFile}>
                    {permission.write &&
                        <>
                            <a className='btn btn-success' href='#' onClick={e => this.downloadBackup(e, item)}>
                                <i className='fa fa-lg fa-download' />
                            </a>

                            <a className='btn btn-warning' href='#' onClick={e => this.restoreBackup(e, item)}>
                                <i className='fa fa-lg fa-refresh' />
                            </a>
                        </>
                        
                    }
                    </TableCell>
                </tr>),
        });
        return<>
                
                <div className='row'>
                    <div className="col-12">
                        {table}
                    </div>
                </div>
                {permission.write ? <CirclePageButton type='create' onClick={e=>e.preventDefault()||this.props.createBackupFile()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, backup: state.framework.backup });
const mapActionsToProps = {getBackupFileAll,deleteBackupFile, createBackupFile, downloadBackupFile,restoreBackupFile};
export default connect(mapStateToProps, mapActionsToProps)(BackupFilePage);