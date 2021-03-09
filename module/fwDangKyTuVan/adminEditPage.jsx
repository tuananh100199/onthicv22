import React from 'react';
import { connect } from 'react-redux';
import { updateDangKyTuVan, getDangKyTuVan } from './redux/reduxDangKyTuVan.jsx'
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';

class DangKyTuVanEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };
        this.editor = React.createRef();
    }
    
    componentDidMount() {
        T.ready('/user/dang-ky-tu-van', () => {
            this.getData();
            $('#dangKyTuVanTitle').focus();
        });
    }

    getData = () => {
        const route = T.routeMatcher('/user/dang-ky-tu-van/edit/:dangKyTuVanId'),
            dangKyTuVanId = route.parse(window.location.pathname).dangKyTuVanId;
        this.props.getDangKyTuVan(dangKyTuVanId, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger');
                this.props.history.push('/user/dang-ky-tu-van');
            } else if (data.item) {
                $('#dangKyTuVanTitle').val(data.item.title);
                $('#dangKyTuVanFormTitle').val(data.item.formTitle);
                this.editor.current.html(data.item.description);
                this.setState(data);
            } else {
                this.props.history.push('/user/dang-ky-tu-van');
            }
        });
    }

    save = () => {
        const             
            changes = {
                title: $('#dangKyTuVanTitle').val(),
                formTitle: $('#dangKyTuVanFormTitle').val(),
                description: this.editor.current.html()
            };
        if (this.props.system.user.permissions.includes('dangKyTuVan:write')) {
            this.props.updateDangKyTuVan(this.state.item._id, changes, () => { })
        } else {

        }
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const item = this.state.item ? this.state.item : {
            title: '',
            content: '',
            createdDate: new Date(),
        };
        let title = item.title;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Đăng ký tư vấn: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title != '' ? 'Tiêu đề: <b>' + title + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/dang-ky-tu-van'>Danh sách đăng ký tư vấn</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <label className='control-label' style={{marginTop: 15}}>Tiêu đề</label>
                                <input defaultValue='' className='form-control' id='dangKyTuVanTitle' placeholder='Tiêu đề đăng ký tư vấn' />
                                <label className='control-label'  style={{marginTop: 15}}>Tiêu đề form</label>
                                <input defaultValue='' className='form-control' id='dangKyTuVanFormTitle' placeholder='Tiêu đề form đăng ký tư vấn' />
                                          
                                <label className='control-label'  style={{marginTop: 15}}>Mô tả đăng ký tư vấn</label>
                                <Editor ref={this.editor} height='400px' placeholder='Mô tả' />
                            </div>
                        </div>
                    </div>
                </div>

                <Link to={'/user/dang-ky-tu-van'} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { updateDangKyTuVan, getDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanEditPage);
