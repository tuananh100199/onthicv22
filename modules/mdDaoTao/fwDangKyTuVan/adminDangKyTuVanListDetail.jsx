import React from 'react';
import { connect } from 'react-redux';
import { getDKTVListPage,getDKTVListItem, updateDKTVList, deleteDKTVListItem, phanHoiDKTVListItem} from './redux/reduxDangKyTuVanList.jsx';
import Editor from 'view/component/CkEditor4.jsx';
import { Link } from 'react-router-dom';


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
            this.props.phanHoiDKTVListItem(this.state._id, this.editor.current.html(), (data) => {
                if (!data.error) {
                    T.notify('Gửi phản hồi đăng ký tư vấn thành công!', 'success');
                }
                $('#submit-btn').removeAttr('disabled');
                $(this.modal.current).modal('hide');
            })
        }
    }
    render() {
        const { lastname, firstname, email, phone } = this.state;
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
                            <label>Tên người dùng: <b>{lastname} {firstname}</b></label><br />
                            <label>Email: <b>{email}</b></label><br />
                            <label>Số điện thoại: <b>{phone}</b></label><br />
                            <h6 style={{ marginTop: 20 }}>Phản hồi đăng ký tư vấn</h6>
                            <div className='form-group'>
                                <Editor ref={this.editor} height='400px' placeholder='Nội dung' />
                            </div>
                        </div>
                        <form>
                            <div className='modal-footer'>
                                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                                <button type='button' className='btn btn-primary' id='submit-btn' onClick={this.save}>Gửi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
class DangKyTuVanListPage extends React.Component {
    modal = React.createRef();
    editor = React.createRef();
    state = {};



    componentDidMount() {
        T.ready('/user/dang-ky-tu-van-list', () => {
            const route = T.routeMatcher('/user/dang-ky-tu-van-list/edit/:DKTVListId'),
                params = route.parse(window.location.pathname);
            this.props.getDKTVListPage(params.DKTVListId);
            this.setState({ DKTVListId: params.DKTVListId });

        });
    }


    showDKTVListItem = (e, DKTVListId) => {
        e.preventDefault();
        this.props.getDKTVListItem(DKTVListId, DKTVList => this.modal.current.show(DKTVList));
    }

    delete = (e, DKTVListId, item) => {
        T.confirm('Xoá đăng ký tư vấn', 'Bạn có chắc muốn xoá đăng ký tư vấn này?', true, isConfirm => isConfirm && this.props.deleteDKTVListItem(DKTVListId, item._id));
        e.preventDefault();
    }

    changeRead = (item) => this.props.updateDKTVList(item._id, { read: !item.read });

    render() {
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có danh sách đăng ký tư vấn!';
        if (this.props.dangKyTuVanList && this.props.dangKyTuVanList.page && this.props.dangKyTuVanList.page.list && this.props.dangKyTuVanList.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '40%' }}>Tên</th>
                            <th style={{ width: '20%' }}>Số điện thoại</th>
                            <th style={{ width: '40%' }}>Email</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dangKyTuVanList.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.showDKTVListItem(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.lastname + ' ' + item.firstname}</a>
                                    <br />
                                    {new Date(item.createdDate).getText()}
                                </td>
                                <td>{item.phone}</td>
                                <td>{item.email}</td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showDKTVListItem(e, item._id)}>
                                            <i className='fa fa-paper-plane' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, this.state.DKTVListId, item)}>
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
                    <h1><i className='fa fa fa-envelope-o' /> Danh sách đăng ký tư vấn</h1>
                </div>
                <div className='row tile'>{table}</div>
                <AdminDangKyTuVanModal ref={this.modal} phanHoiDKTVListItem={this.props.phanHoiDKTVListItem}/>
                <Link to='/user/dang-ky-tu-van-list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
            </main>
        );
    }
}

const mapStateToProps = state => ({ dangKyTuVanList: state.dangKyTuVanList });
const mapActionsToProps = { getDKTVListPage, getDKTVListItem, updateDKTVList, deleteDKTVListItem, phanHoiDKTVListItem };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanListPage);