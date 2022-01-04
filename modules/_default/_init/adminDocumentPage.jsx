import React from 'react';
import { connect } from 'react-redux';
import { getListDocument, deleteDocument } from './redux';
import { AdminPage, FormFileBox } from 'view/component/AdminPage';
import '../fwNotification/style.scss';

class SettingsPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready(() => {
            this.props.getListDocument();
        });
    }

    icon = (filename) => {
        if (filename.endsWith('.docx') || filename.endsWith('.doc')) {
            return 'icon fa fa-3x fa-file-word-o';
        } else if (filename.endsWith('.xlsx')) {
            return 'icon fa fa-3x fa-file-excel-o';
        } else {
            return 'icon fa fa-3x fa-file-o';
        }
    }

    delete = (e, filename) => {
        e.preventDefault();
        T.confirm('Xoá tài liệu', 'Bạn có chắc muốn xoá tài liệu ' + filename, true, isConfirm =>
            isConfirm && this.props.deleteDocument(filename));
    }

    render() {
        const listDocument = this.props.system && this.props.system.listDocument;
        const gridFileIcon = (filename, index) => (
            <div className='col-md-6 d-flex justify-content-center' key={index}>
                <div className='card' style={{ 'width': '20rem', marginBottom: '10px' }}>
                    <div className='card-img-top pt-1 text-center'><i className={this.icon(filename)}></i></div>
                    <div className='card-body py-0'>
                        <a href={'/document/' + filename} className='text-primary ml-4' ><h6 className='card-title text-center'>{filename}</h6></a>
                    </div>
                    <div className='card-body pt-0 text-right'>
                        <a href={'/document/' + filename} className='card-link text-primary' ><i className='fa fa-lg fa-download' /></a>
                        <a href='#' className='card-link text-danger' onClick={e => this.delete(e, filename)}><i className='fa fa-lg fa-trash' /></a>
                    </div>
                </div>
            </div>
        );
        // const listFileIcon = (filename, index) => (
        //     <li key={index} className='notification'>
        //         {index + 1}. &nbsp;
        //         <a href={'/document/' + filename} className='text-primary'>
        //             <div className='d-flex align-items-start'>
        //                 <i className={this.icon(filename)}></i>
        //                 <div className='pl-2'>
        //                     <p >{filename}</p>
        //                 </div>
        //             </div>
        //         </a>
        //         <a href={'/document/' + filename} className='notification-button text-primary' ><i className='fa fa-lg fa-download' /></a>
        //         <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, filename)}><i className='fa fa-lg fa-trash' /></a>
        //     </li>
        // );
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Tài liệu',
            breadcrumb: ['Tài liệu'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Import file tài liệu mới</h3>
                    <FormFileBox ref={e => this.fileBox = e} uploadType='DiemThiTotNghiepFile'
                        onSuccess={this.onUploadSuccess} r />
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Danh sách tài liệu</h3>
                    {/* <div className='text-right mb-3'>
                        <button style={{ border: 'none', outline: 'none', marginRight: '3px', backgroundColor: '' }} ><i className='fa fa-bars'></i> Danh sách</button>
                        <button style={{ border: 'none', outline: 'none', backgroundColor: '#2189CF' }} ><i className='fa fa-calendar'></i> Lưới</button>
                    </div> */}
                    <div className='tile-body row'>
                        {/* {<ul style={{ paddingLeft: 12, listStyleType: 'none' }}>
                            {listDocument && listDocument.length && listDocument.map((document, index) => (
                                listFileIcon(document, index)
                            ))}
                        </ul>} */}
                        {listDocument && listDocument.length && listDocument.map((document, index) => (
                            gridFileIcon(document, index)
                        ))}
                    </div>
                </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getListDocument, deleteDocument };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);