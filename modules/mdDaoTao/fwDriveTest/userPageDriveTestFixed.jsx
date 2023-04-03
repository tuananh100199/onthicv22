import React from 'react';
import { connect } from 'react-redux';
// import { Link } from 'react-router-dom';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { getDriveTestPage } from './redux';
import { AdminPage, CirclePageButton, PageIcon } from 'view/component/AdminPage';
import { getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';

class UserDriveTestPage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getCategoryAll('drive-question', null, (items) =>
            this.setState({ types: (items || []).map(item => ({ _id: item._id, text: item.title, count: item.count })) }));
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.ready();
    }

    create = e => e.preventDefault() || this.modal.show();

    render() {
        const types = this.state.types ? this.state.types : [], readOnly = true;
        return this.renderPage({
            icon: 'fa fa-check-square-o',
            title: 'BỘ ĐỀ CỐ ĐỊNH THEO TỪNG LOẠI',
            breadcrumb: ['Bộ đề thi thử'],
            content: <>
                <div className='tile-body'>
                <div className='row'>
                <div className='row'>
                    {types.map((item, index) =>
                        <PageIcon to={`/user/hoc-vien/khoa-hoc/bo-de-co-dinh/${item._id}`} key={index} icon='fa-cloud' iconBackgroundColor='#7cb342' text={`${item.text} - ${item.count} câu`} />)}
                    {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
                </div>
            </div>
            </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseTypeAll, getDriveTestPage, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(UserDriveTestPage);
