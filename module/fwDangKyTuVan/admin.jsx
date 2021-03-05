import React from 'react';
import { connect } from 'react-redux';
import { getDangKyTuVanPage, getDangKyTuVan, updateDangKyTuVan, deleteDangKyTuVan, phanHoiDangKyTuVan } from './redux.jsx';
import Pagination from '../../view/component/Pagination.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

class AdminDangKyTuVanModal extends React.Component {
    state = {};
    modal = React.createRef();
    editor = React.createRef();


    show = (item) => {
        this.setState(item);
        $(this.modal.current).modal('show');
    }

    save = () => {
        $('#submit-btn').attr('disabled', true);
        if (!this.editor.current.html()) {
            T.notify('Nội dung phản hồi bị trống', 'danger');
        } else {
            this.props.phanHoiDangKyTuVan(this.state._id, this.editor.current.html(), (data) => {
                if (!data.error) {
                    T.notify('Gửi phản hồi đăng ký tư vấn thành công!', 'success');
                }
                $('#submit-btn').removeAttr('disabled');
                $(this.modal.current).modal('hide');
            })
        }
    }
    render() {
        const { name, subject, email, message, phone } = this.state;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin đăng ký tư vấn</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <label>Tên người dùng: <b>{name}</b></label><br />
                            <label>Chủ đề: <b>{subject}</b></label><br />
                            <label>Email: <b>{email}</b></label><br />
                            <label>Số điện thoại: <b>{phone}</b></label><br />
                            <p>{message}</p>
                            <h6>Phản hồi đăng ký tư vấn</h6>
                            <div className="form-group">
                                <Editor ref={this.editor} height='400px' placeholder='Nội dung' />
                            </div>
                        </div>
                        <form>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Đóng</button>
                                <button type="button" className="btn btn-primary" id="submit-btn" onClick={this.save}>Gửi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
class DangKyTuVanPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getDangKyTuVanPage();
        T.ready('/user/settings');
    }

    showDangKyTuVan = (e, dangKyTuVanId) => {
        e.preventDefault();
        this.props.getDangKyTuVan(dangKyTuVanId, dangKyTuVan => this.modal.current.show(dangKyTuVan));
    }

    changeRead = (item) => this.props.updateDangKyTuVan(item._id, {  read: !item.read });

    delete = (e, item) => {
        T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm => isConfirm && this.props.deleteDangKyTuVan(item._id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.dangKyTuVan && this.props.dangKyTuVan.page ?
            this.props.dangKyTuVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có thông tin đăng ký tư vấn!';
        if (this.props.dangKyTuVan && this.props.dangKyTuVan.page && this.props.dangKyTuVan.page.list && this.props.dangKyTuVan.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '40%' }}>Chủ đề</th>
                            <th style={{ width: '20%' }}>Số điện thoại</th>
                            <th style={{ width: '40%' }}>Tên & Email</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dangKyTuVan.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.showDangKyTuVan(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.subject}</a>
                                    <br />
                                    {new Date(item.createdDate).getText()}
                                </td>
                                <td>{item.phone}</td>
                                <td>{item.name}<br />{item.email}</td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showDangKyTuVan(e, item._id)}>
                                            <i className='fa fa-paper-plane' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa fa-envelope-o' /> Đăng ký tư vấn</h1>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageDangKyTuVan' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDangKyTuVanPage} />
                <AdminDangKyTuVanModal ref={this.modal} phanHoiDangKyTuVan={this.props.phanHoiDangKyTuVan} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { getDangKyTuVanPage, getDangKyTuVan, updateDangKyTuVan, deleteDangKyTuVan, phanHoiDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);