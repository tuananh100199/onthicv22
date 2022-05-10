import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, PageIcon } from 'view/component/AdminPage';

class AssignRolePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/assign-role');
    }

    render() {
        const permission = this.getUserPermission('assignRole');
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Nhân sự',
            breadcrumb: ['Nhân sự'],
            content: (
                <div className='row user-course'>
                    <PageIcon visible={permission.write} to={'/user/assign-role/course-admin'} icon='fa-cubes' iconBackgroundColor='#17a2b8' text='Quản trị khóa học' />
                    
                    {/* TODO:Vỹ- Tạo trang assignRole để gán quyền cho USER, hiện  tại vẫn đang phải thao tác dựa trên roles */}
                    <PageIcon visible={permission.write} to={'/user/assign-role/course-enroll'} icon='fa-user-plus' iconBackgroundColor='#8e24aa' text='Tuyển sinh ' />
                    <PageIcon visible={permission.write} to={'/user/assign-role/course-teacher'} icon='fa-pencil' iconBackgroundColor='#dc143c' text='Quản lý giáo viên' />
                    <PageIcon visible={permission.write} to={'/user/assign-role/course-device'} icon='fa-university' iconBackgroundColor='#CC0' text='Quản lý cơ sở vật chất,thiết bị, phương tiện, nhiên liệu' />
                    <PageIcon visible={permission.write} to={'/user/assign-role/course-accountant'} icon='fa-money' iconBackgroundColor='#4e25a2' text='Quản lý tài chính' />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { };
export default connect(mapStateToProps, mapActionsToProps)(AssignRolePage);