import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

class AdminFacilityPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/facility', () => {});
    }

    render() {
        const permission = this.getUserPermission('facility', ['read', 'write', 'delete']);
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Quản lý cơ sở vật chất',
            breadcrumb: ['Quản lý cơ sở vật chất'],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />
                    <PageIcon visible={permission.write} to={'/user/facility/manager'} icon='fa-info' iconBackgroundColor='#17a2b8' text='Danh sách cơ sở vật chất' />
                    <PageIcon visible={permission.write} to={'/user/facility/category'} icon='fa-list' iconBackgroundColor='#8e24aa' text='Danh mục cơ sở vật chất' />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminFacilityPage);
