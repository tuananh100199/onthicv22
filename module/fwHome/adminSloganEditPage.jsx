import React from 'react';
import { connect } from 'react-redux';
import { getSloganItem, updateSlogan, addSloganIntoGroup, updateSloganInGroup, removeSloganFromGroup, swapSloganInGroup } from './redux/reduxSlogan.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

class SloganModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { readOnly: false };

        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#seiViTitle').focus());
        }, 250));
    }

    imageChanged = (data) => {
        this.setState({ image: data.url });
    }

    show = (selectedItem, index, readOnly) => {
        let { title, image, content } = selectedItem ? selectedItem : { title: '', image: '', content: '' };
        title = T.language.parse(title, true);
        content = T.language.parse(content, true);

        $('#seiViTitle').val(title.vi);
        $('#seiEnTitle').val(title.en);
        this.viEditor.current.html(content.vi);
        this.enEditor.current.html(content.en);
        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        this.imageBox.current.setData('Slogan', image);
        this.setState({ image, readOnly });

        $(this.modal.current).modal('show');
    }
    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        const btnSave = $(this.btnSave.current),
            isNewMember = btnSave.data('isNewMember'),
            index = btnSave.data('index'),
            title = JSON.stringify({ vi: $('#seiViTitle').val(), en: $('#seiEnTitle').val() }),
            content = JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() });
        if (isNewMember) {
            this.props.addSlogan(title, this.state.image, content);
        } else {
            this.props.updateSlogan(index, title, this.state.image, content);
        }
        event.preventDefault();
    }

    render() {
        const readOnly = this.state.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Slogan</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#sloganViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#sloganEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='sloganViTab' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label htmlFor='seiViTitle'>Tiêu đề</label><br />
                                        <input className='form-control' id='seiViTitle' type='text' placeholder='Tiêu đề' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Nội dung</label>
                                        <Editor ref={this.viEditor} placeholder='Nội dung' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div id='sloganEnTab' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label htmlFor='seiEnTitle'>Title</label><br />
                                        <input className='form-control' id='seiEnTitle' type='text' placeholder='Title' readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label>Content</label>
                                        <Editor ref={this.enEditor} placeholder='Content' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label>Hình ảnh</label>
                                <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='SloganImage' userData='Slogan' success={this.imageChanged} readOnly={readOnly} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly ? <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button> : null}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class SloganEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/settings', () => {
            const route = T.routeMatcher('/user/slogan/edit/:sloganId'),
                params = route.parse(window.location.pathname);

            this.props.getSloganItem(params.sloganId, data => {
                if (data.error) {
                    T.notify('Lấy nhóm slogan bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    $('#slgTitle').val(data.item.title).focus();
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showAddSloganModal = () => this.modal.current.show();
    showEditSloganModal = (e, selectedSlogan, index) => {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        this.modal.current.show(selectedSlogan, index, readOnly);
        e.preventDefault();
    }

    add = (title, image, content) => {
        this.props.addSloganIntoGroup(title, image, content);
        this.modal.current.hide();
    };
    update = (index, title, image, content) => {
        this.props.updateSloganInGroup(index, title, image, content);
        this.modal.current.hide();
    };

    remove = (e, index) => {
        this.props.removeSloganFromGroup(index);
        e.preventDefault();
    }
    swap = (e, index, isMoveUp) => {
        this.props.swapSloganInGroup(index, isMoveUp);
        e.preventDefault();
    };

    save = () => {
        const changes = {
            title: $('#slgTitle').val(),
            items: this.props.slogan.item.items,
        };
        if (changes.items && changes.items.length == 0) changes.items = 'empty';
        this.props.updateSlogan(this.props.slogan.item._id, changes);
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null,
            currentSlogan = this.props.slogan ? this.props.slogan.item : null;
        if (currentSlogan && currentSlogan.items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: '70%' }}>Tiêu đề</th>
                            <th style={{ width: '30%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSlogan.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <a href='#' onClick={e => this.showEditSloganModal(e, item, index)}>{T.language.parse(item.title)}</a>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image} style={{ width: '100%' }} />
                                </td>
                                <td>
                                    {readOnly ?
                                        <div className='btn-group'>
                                            <a className='btn btn-primary' href='#' onClick={e => this.showEditSloganModal(e, item, index)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                        </div> :
                                        <div className='btn-group'>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                                <i className='fa fa-lg fa-arrow-down' />
                                            </a>
                                            <a className='btn btn-primary' href='#' onClick={e => this.showEditSloganModal(e, item, index)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                            <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </div>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có slogan!</p>;
        }

        const title = currentSlogan && currentSlogan.title && currentSlogan.title != '' ? currentSlogan.title : '<empty>';
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-yelp' /> Slogan: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <div className='form-group'>
                                <label className='control-label'>Tiêu đề</label>
                                <input className='form-control' type='text' placeholder='Tiêu đề' id='slgTitle' defaultValue={title} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                {table}
                            </div>
                        </div>
                        {readOnly ? null :
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={this.showAddSloganModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                    </button>&nbsp;
                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                    </div>
                                </div>
                            </div>}
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <SloganModal ref={this.modal} addSlogan={this.add} updateSlogan={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, slogan: state.slogan });
const mapActionsToProps = { getSloganItem, updateSlogan, addSloganIntoGroup, updateSloganInGroup, removeSloganFromGroup, swapSloganInGroup };
export default connect(mapStateToProps, mapActionsToProps)(SloganEditPage);
