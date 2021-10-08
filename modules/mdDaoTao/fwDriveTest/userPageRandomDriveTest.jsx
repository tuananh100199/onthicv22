import React from 'react';
import { connect } from 'react-redux';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

class UserPageRandomDriveTest extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready();
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ _id: item._id, title: item.title }));
            this.setState({ courseTypes });
        });
    }

    render() {
        const { courseTypes } = this.state ? this.state : [];
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Bộ đề thi ngẫu nhiên ',
            breadcrumb: ['Bộ đề thi ngẫu nhiên'],
            content: (
                <div className='row'>
                    <PageIconHeader text='Loại đề thi' />
                    {courseTypes && courseTypes.map((type, index) => (
                        <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien/${type._id}`} icon='fa-cubes' iconBackgroundColor='#17a2b8' text={'Loại ' + type.title} />
                    ))}
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPageRandomDriveTest);
