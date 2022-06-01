import React from 'react';
import { connect } from 'react-redux';
import { AdminPage } from 'view/component/AdminPage';
import '../../mdDaoTao/fwCourse/huongDan.css';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready();
    }

    // onDocumentLoadError = () => {
    //     this.setState({ isLoadSuccess: false});
    // };

    render() {
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn sử dụng: Quản lý thiết bị',
            breadcrumb: ['Hướng dẫn sử dụng quản lý thiết bị'],
            content: (
                <div className='tile'>
                    <iframe src="/document/huongDan/quanLyXe.pdf" width='100%' height='550'></iframe>
                </div>
            ),
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
