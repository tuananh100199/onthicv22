import React from 'react';
import { connect } from 'react-redux';
import { getListDocument, saveTaiLieuHuongDan } from './redux';
import { AdminPage, FormFileBox, FormSelect } from 'view/component/AdminPage';
// import { Document, Page } from 'react-pdf/dist/esm/entry.webpack5';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import '../fwNotification/style.scss';

const listHuongDan = [{ id: 'hocVien', text: 'Học viên'}, { id: 'giaoVien', text: 'Giáo viên'}, { id: 'keToan', text:'Kế toán'}, { id:'tuyenSinh', text: 'Tuyển sinh'}, { id:'quanLyXe', text:'Quản lý xe'}, { id:'admin', text:'Quản trị hệ thống'}];
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

    onUploadSuccess = (data) => {
        this.setState({url: data && data.srcPath, filename: data && data.filename});
    }

    save = () => {
        if (!this.type.value()) {
            T.notify('Chưa chọn đối tượng hướng dẫn!', 'danger');
            this.type.focus();
        } else {
            this.props.saveTaiLieuHuongDan(this.state.url,this.type.value(), data => {
                if (data.error) {
                    T.notify('Import hướng dẫn bị lỗi!', 'danger');
                } else {
                    T.notify('Import hướng dẫn thành công!', 'success');
                    this.onReUpload();
                }
            });
        }
    }

    onReUpload = () => {
        this.setState({ url: null, filename: '' });
    }

    render() {
        const { url, filename } = this.state;
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Tài liệu hướng dẫn',
            breadcrumb: ['Tài liệu hướng dẫn'],
            content: <>
                {url ? 
                <div className='tile'>
                    <FormSelect style={{width: '300px'}} ref={e => this.type = e} label='Đối tượng hướng dẫn' data={listHuongDan} readOnly={false} />
                    <p>{filename}</p>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-danger' type='button' style={{ marginRight: 10 }} onClick={this.onReUpload}>
                            <i className='fa fa-fw fa-lg fa-cloud-upload' /> Upload lại
                        </button>
                        <button className='btn btn-primary' type='button' onClick={this.save}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>
                : <div className='tile'>
                    <h3 className='tile-title'>Import file hướng dẫn mới</h3>
                    <FormFileBox ref={e => this.fileBox = e} uploadType='HuongDanHeThongFile'
                        onSuccess={this.onUploadSuccess} />
                </div>}
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getListDocument, saveTaiLieuHuongDan };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);