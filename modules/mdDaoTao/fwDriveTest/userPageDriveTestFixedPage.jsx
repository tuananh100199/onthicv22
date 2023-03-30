import React from 'react';
import { connect } from 'react-redux';
// import { Link } from 'react-router-dom';
import { getDriveTestFixed } from 'modules/mdDaoTao/fwDriveTest/redux';
import { AdminPage, PageIcon } from 'view/component/AdminPage';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';

const backRoute = '/user/hoc-vien/khoa-hoc/bo-de-co-dinh';
class UserDriveTestPage extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/bo-de-co-dinh/:_id'),
        params = route.parse(window.location.pathname);
        this.props.getDriveTestFixed(params._id, data => {
            this.setState({ list:  data.chunkList, categories: params._id});
        });
        T.ready();
    }

    render() {
        const { list, categories }= this.state ? this.state : [];
        return this.renderPage({
            icon: 'fa fa-check-square-o',
            title: 'BỘ ĐỀ CỐ ĐỊNH THEO TỪNG LOẠI',
            breadcrumb: ['Bộ đề thi thử'],
            backRoute: backRoute,
            content: <> {list && list.length ? 
            <div className='tile-body'>
                <div className='row'>
                    {list && list.map((item, index) => 
                        <PageIcon className='col-md-4' to={`/user/hoc-vien/khoa-hoc/bo-de-co-dinh/${categories}/${index}`} key={index} icon='fa-cloud' iconBackgroundColor='#7cb342' text={`Bộ đề ${index + 1} - ${item.length} câu`} />
                    )}
                </div>
            </div> : <div className='tile'>Không có dữ liệu</div>}
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll, getDriveTestFixed };
export default connect(mapStateToProps, mapActionsToProps)(UserDriveTestPage);
