import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from '../fwCourse/redux';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import '../fwCourse/huongDan.css';


const previousRoute = '/user';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/dang-ky-lich-hoc/huong-dan'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        this.setState({name: data.item.name});
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
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
        const { courseId, name, numPages} = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId;
        const options = {
            cMapUrl: 'cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'standard_fonts/',
          };
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn sử dụng: ' + (name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Hướng dẫn sử dụng học viên'],
            content: (
                <>
                    <div className='tile'>
                        <div className='document-container'>
                            <Document file={'/document/huongDan/hocVienDangKyLichHoc.pdf'} onLoadError={this.onDocumentLoadError} onLoadSuccess={this.onDocumentLoadSuccess} options={options}>
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
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
