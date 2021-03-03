import React from 'react';
import { connect } from 'react-redux';
import { getDangKyTuVanPage, getDangKyTuVan, updateDangKyTuVan, deleteDangKyTuVan } from './redux.jsx';
import Pagination from '../../view/component/Pagination.jsx';
import Editor from '../../view/component/CkEditor4.jsx';


class AdminPhanHoiDangKyTuVan extends React.Component {
    constructor(props) {
        super(props);
        this.adminPhanHoiModal = React.createRef();
        this.editor = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.adminPhanHoiModal.current).on('shown.bs.modal', () => {});
        });
    }
    show = () => {
        console.log('gọi qua show adminPhanhoi');

        $(this.adminPhanHoiModal.current).modal('show')
    }


    // save = () => {
    //     $("#submit-btn").attr("disabled", true);
    //     if (!this.editor.current.html()) {
    //         $("#submit-btn").removeAttr("disabled");
    //         T.notify('Lý do không được để trống', 'danger');
    //     } else {
    //         let reasonOfForm = {
    //             reason: this.editor.current.html(),
    //             approve: "eject"
    //         }
    //         this.props.updateForm(this.props.donDeNghiHoc.item._id, reasonOfForm);
    //         this.props.sendEmailTuChoiDonDeNghiHoc(this.props.donDeNghiHoc.item._id, () => {
    //             $("#submit-btn").removeAttr("disabled");
    //             $('#modal').modal('hide');
    //         })

    //     }
    // }
    render() {
        console.log('gọi qua render AdminPhanHoi');
        return (
            <div className="modal fade" id="modal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" ref={this.adminPhanHoiModal}>
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Phản hồi đăng ký tư vấn</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form>
                            <div className="modal-body mx-3">
                                <div className="form-group">
                                    <Editor ref={this.editor} height='400px' placeholder='Nội dung' />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal">Đóng</button>
                                <button type="button" className="btn btn-primary" id="submit-btn">Gửi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

class AdminDangKyTuVanModal extends React.Component {
    state = {};
    modal = React.createRef();
    responseModal = React.createRef();


    show = (item) => {
        this.setState(item);
        $(this.modal.current).modal('show');
    }

    response = (e) => {
        console.log('gọi qua response');
        this.responseModal.current.show(null);
        e.preventDefault();
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
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-primary' data-dismiss='modal' onClick={this.response}>Phản hồi</button>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>

                            <AdminPhanHoiDangKyTuVan  ref={this.responseModal} />
                        </div>
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

    showDangKyTuVan = (e, DangKyTuVanId) => {
        e.preventDefault();
        this.props.getDangKyTuVan(DangKyTuVanId, DangKyTuVan => this.modal.current.show(DangKyTuVan));
    }

    changeRead = (item) => this.props.updateDangKyTuVan(item._id, {  read: !item.read });

    delete = (e, item) => {
        T.confirm('Xoá liên hệ', 'Bạn có chắc muốn xoá liên hệ này?', true, isConfirm => isConfirm && this.props.deleteDangKyTuVan(item._id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.DangKyTuVan && this.props.DangKyTuVan.page ?
            this.props.DangKyTuVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có thông tin đăng ký tư vấn!';
        if (this.props.DangKyTuVan && this.props.DangKyTuVan.page && this.props.DangKyTuVan.page.list && this.props.DangKyTuVan.page.list.length > 0) {
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
                        {this.props.DangKyTuVan.page.list.map((item, index) => (
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
                <AdminDangKyTuVanModal ref={this.modal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ DangKyTuVan: state.DangKyTuVan });
const mapActionsToProps = { getDangKyTuVanPage, getDangKyTuVan, updateDangKyTuVan, deleteDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);