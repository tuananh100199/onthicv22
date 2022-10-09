import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

class AdminDevicePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/device', () => {});
    }

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete']);
        return this.renderPage({
            icon: 'fa fa-desktop',
            title: 'Quản lý thiết bị',
            breadcrumb: ['Quản lý thiết bị'],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />
                    <PageIcon visible={permission.write} to={'/user/device/manager'} icon='fa-info' iconBackgroundColor='#17a2b8' text='Danh sách thiết bị' />
                    <PageIcon visible={permission.write} to={'/user/device/category'} icon='fa-list' iconBackgroundColor='#8e24aa' text='Danh mục thiết bị ' />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminDevicePage);
