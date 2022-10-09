import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox, FormTextBox,FormTabs } from 'view/component/AdminPage';
import { getSystemSettings,updateSystemSettings } from 'modules/_default/_init/redux';
import BackupDatabasePage from './pages/adminBackupDatabasePage';
import BackupFilePage from './pages/adminBackupFilePage';
const backupSettingKeys = ['backupCreateDaily','backupDeleteDaily','backupExpireDay'];

class BackupPage extends AdminPage {
    state = {}
    componentDidMount() {
        T.ready('/user/backup',()=>{
            this.props.getSystemSettings(backupSettingKeys,data=>{
                this.backupCreateDaily.value(data.backupCreateDaily? true:false);
                this.backupDeleteDaily.value(data.backupDeleteDaily ? true:false);
                this.backupExpireDay.value(data.backupExpireDay ? data.backupExpireDay:'');
                this.setState({backupDeleteDaily:data.backupDeleteDaily ? true:false});
            });
        });
    }

    deleteBackup = (e, item) => e.preventDefault() || T.confirm('Xóa backup', `Bạn có chắc bạn muốn xóa backup ${item.filename}?`, true,
        isConfirm => isConfirm && this.props.deleteBackup(item.filename));

    downloadBackup = (e,item)=>{
        e.preventDefault();
        this.props.downloadBackup(item.filename, () => {
            T.notify('Tải backup thành công!', 'success');
        });
    }

    restoreBackup = (e, item) => e.preventDefault() || T.confirm('Restore dữ liệu', `Bạn có chắc bạn muốn restore lại dữ liệu theo bản ${item.filename}?`, true,
    isConfirm => isConfirm && this.props.restoreBackup(item.filename));

    saveSettings = ()=>{
        const changes = {
            backupCreateDaily: this.backupCreateDaily.value()?1:0,
            backupDeleteDaily: this.backupDeleteDaily.value()?1:0,
            backupExpireDay: this.backupExpireDay.value(),
        };
        if(changes.backupDeleteDaily && (!changes.backupExpireDay||changes.backupExpireDay=='')){
            T.notify('Số ngày lưu trữ backup bị trống!', 'danger');
                this.backupExpireDay.focus();
        }else{
            this.props.updateSystemSettings(changes,()=>this.setState(changes));
        }
    }

    render() {
        const permission = this.getUserPermission('backup');
        let tabs = [];
        tabs.push({ key: tabs.length, title: 'Database', component: <BackupDatabasePage permission={permission}/> });
        tabs.push({ key: tabs.length, title: 'File', component: <BackupFilePage permission={permission}/> });
        return this.renderPage({
            icon: 'fa fa-database',
            title: 'Backup',
            breadcrumb: ['Backup'],
            content: <>
                <div className="tile">
                    <div className="tile-title">Cấu hình</div>
                    <div className="tile-body">
                        <div className="row">
                            <FormCheckbox ref={e => this.backupCreateDaily = e} className='col-md-4' isSwitch={true} label='Tạo backup hằng ngày' readOnly={!permission.write} />
                            <FormCheckbox ref={e => this.backupDeleteDaily = e} className='col-md-4' isSwitch={true} label='Xóa backup theo ngày' readOnly={!permission.write} onChange= {value=>this.setState({backupDeleteDaily:value})} />
                            <div className="col-md-4" style = {{display: this.state.backupDeleteDaily ? 'block':'none'}}>
                                <FormTextBox ref={e => this.backupExpireDay = e} type='number' label='Số ngày lưu trữ backup' readOnly={!permission.write} />
                            </div>
                        </div>
                    </div>
                    <div className="tile-footer" style={{textAlign:'right'}}>
                        <button className="btn btn-primary" onClick={e=>e.preventDefault()||this.saveSettings()}>Lưu</button>
                    </div>
                </div>
                <FormTabs id='backupPageTab' contentClassName='tile' tabs={tabs} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSystemSettings,updateSystemSettings };
export default connect(mapStateToProps, mapActionsToProps)(BackupPage);