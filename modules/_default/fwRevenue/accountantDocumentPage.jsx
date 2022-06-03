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
            title: 'Hướng dẫn sử dụng: Kế toán',
            breadcrumb: ['Hướng dẫn sử dụng kế toán'],
            content: (
                <div className='tile'>
                    <iframe className='document-container' src="/document/huongDan/keToan.pdf#zoom=60"></iframe>
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
