import React from 'react';
import { connect } from 'react-redux';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { AdminPage } from 'view/component/AdminPage';
import '../../mdDaoTao/fwCourse/huongDan.css';
class UserDocumentPage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready();
    }

    onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        this.setState({ numPages: nextNumPages});
    };

    // onDocumentLoadError = () => {
    //     this.setState({ isLoadSuccess: false});
    // };

    render() {
        const { numPages} = this.state;
        const options = {
            cMapUrl: 'cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'standard_fonts/',
          };
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Hướng dẫn sử dụng: Tuyển sinh',
            breadcrumb: ['Chỉ tiêu tuyển sinh'],
            content: (
                <>
                    <div className='tile'>
                        <div className='document-container'>
                            <Document file={'/document/huongDan/tuyenSinh.pdf'} onLoadSuccess={this.onDocumentLoadSuccess} options={options}>
                                {Array.from(new Array(numPages), (el, index) => (
                                <Page key={`page_${index + 1}`} pageNumber={index + 1} />
                                ))}
                            </Document>
                        </div>
                    </div>
                </>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(UserDocumentPage);
