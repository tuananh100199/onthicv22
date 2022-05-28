import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent } from './redux';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import '../fwCourse/huongDan.css';


const previousRoute = '/user';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/huong-dan/:_id').parse(url);
        this.setState({ subjectId: params._id, courseId: params.courseId });
        if (params._id) {
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push(previousRoute);
                } else if (data.notify) {
                    T.alert(data.notify, 'error', false, 2000);
                    this.props.history.push(previousRoute);
                } else if (data.item) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + this.state.courseId);
                    this.setState(data.item);
                } else {
                    this.props.history.push(previousRoute);
                }
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        this.setState({ numPages: nextNumPages});
    };

    // onDocumentLoadError = () => {
    //     this.setState({ isLoadSuccess: false});
    // };

    render() {
        const {numPages} = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId;
        const options = {
            cMapUrl: 'cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'standard_fonts/',
          };
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn môn học',
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Hướng dẫn sử dụng'],
            content: (
                <>
                    <div className='tile'>
                        <div className='document-container'>
                            <Document file={'/document/huongDan/hocVienLyThuyet.pdf'} onLoadError={this.onDocumentLoadError} onLoadSuccess={this.onDocumentLoadSuccess} options={options}>
                                {Array.from(new Array(numPages), (el, index) => (
                                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                                ))}
                            </Document>
                        </div>
                    </div>
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getSubjectByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
