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
            title: 'Hướng dẫn sử dụng: Quản trị viên khoá học',
            breadcrumb: ['Hướng dẫn sử dụng Quản trị viên khoá học'],
            content: (
                <div className='tile'>
                    <iframe src="/document/huongDan/quanTriKhoaHoc.pdf" width='100%' height='550'></iframe>
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
