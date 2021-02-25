import React from 'react';
import { connect } from 'react-redux';
import { getTestimonyItem, updateTestimony, addTestimonyIntoGroup, updateTestimonyInGroup, removeTestimonyFromGroup, swapTestimonyInGroup } from './redux/reduxTestimony.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

class TestimonyModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.viImageBox = React.createRef();
        this.enImageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        T.ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#ttmViFullname').focus());
        });
    }

    imageChanged = (data) => {
        this.setState({ image: data.image });
    }

    show = (selectedItem, index) => {
        let { fullname, jobPosition, image, content } = selectedItem ? selectedItem : { fullname: '', jobPosition: '', image: '', content: '' };
        fullname = T.language.parse(fullname, true);
        jobPosition = T.language.parse(jobPosition, true);
        content = T.language.parse(content, true);
        $('#ttmViFullname').val(fullname.vi);
        $('#ttmEnFullname').val(fullname.en);
        $('#ttmViJobPosition').val(jobPosition.vi);
        $('#ttmEnJobPosition').val(jobPosition.en);
        this.viEditor.current.html(content.vi);
        this.enEditor.current.html(content.en);
        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        this.viImageBox.current.setData('testimony:' + (selectedItem ? this.props._id + '_' + new Date().getTime() : 'new'));
        this.enImageBox.current.setData('testimony:' + (selectedItem ? this.props._id + '_' + new Date().getTime() : 'new'));
        this.setState({ image });

        $(this.modal.current).modal('show');
    }
    hide() {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        const btnSave = $(this.btnSave.current),
            isNewMember = btnSave.data('isNewMember'),
            index = btnSave.data('index'),
            fullname = JSON.stringify({ vi: $('#ttmViFullname').val(), en: $('#ttmEnFullname').val() }),
            jobPosition = JSON.stringify({ vi: $('#ttmViJobPosition').val(), en: $('#ttmEnJobPosition').val() }),
            content = JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() });
        if (isNewMember) {
            this.props.addTestimony(fullname, jobPosition, this.state.image, content);
        } else {
            this.props.updateTestimony(index, fullname, jobPosition, this.state.image, content);
        }
        event.preventDefault();
    }

    render() {
        return (
            // TODO: Lỗi tải lên ảnh cho Testimony: có tạo ảnh trong DB nhưng không hiển thị ảnh trên ImageBox.
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Testimony</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#ttmViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#ttmEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='ttmViTab' className='tab-pane fade show active'>
                                    <div className='row'>
                                        <div className='col-8'>
                                            <div className='form-group'>
                                                <label htmlFor='ttmViFullname'>Họ và Tên</label><br />
                                                <input className='form-control' id='ttmViFullname' type='text' placeholder='Họ và Tên' />
                                            </div>
                                            <div className='form-group'>
                                                <label htmlFor='ttmViJobPosition'>Vị trí việc làm</label><br />
                                                <input className='form-control' id='ttmViJobPosition' type='text' placeholder='Vị trí việc làm' />
                                            </div>
                                        </div>
                                        <div className='col-4'>
                                            <div className='form-group'>
                                                <label>Hình ảnh</label>
                                                <ImageBox ref={this.viImageBox} postUrl='/user/upload' uploadType='TestimonyImage' userData='testimony' image={this.state.image} success={this.imageChanged} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='sgaContent'>Nội dung</label>
                                        <Editor ref={this.viEditor} placeholder='Nội dung' />
                                    </div>
                                </div>

                                <div id='ttmEnTab' className='tab-pane fade'>
                                    <div className='row'>
                                        <div className='col-8'>
                                            <div className='form-group'>
                                                <label htmlFor='ttmEnFullname'>Fullname</label><br />
                                                <input className='form-control' id='ttmEnFullname' type='text' placeholder='Fullname' />
                                            </div>
                                            <div className='form-group'>
                                                <label htmlFor='ttmEnJobPosition'>Job position</label><br />
                                                <input className='form-control' id='ttmEnJobPosition' type='text' placeholder='Job position' />
                                            </div>
                                        </div>
                                        <div className='col-4'>
                                            <div className='form-group'>
                                                <label>Hình ảnh</label>
                                                <ImageBox ref={this.enImageBox} postUrl='/user/upload' uploadType='TestimonyImage' userData='testimony' image={this.state.image} success={this.imageChanged} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='sgaContent'>Content</label>
                                        <Editor ref={this.enEditor} placeholder='Content' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class TestimonyEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/settings', () => {
            const route = T.routeMatcher('/user/testimony/edit/:testimonyId'),
                params = route.parse(window.location.pathname);

            this.props.getTestimonyItem(params.testimonyId, data => {
                if (data.error) {
                    T.notify('Lấy nhóm testimony bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const title = T.language.parse(data.item.title, true)
                    $('#tepViTitle').val(title.vi).focus();
                    $('#tepEnTitle').val(title.en);
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showAddTestimonyModal = () => this.modal.current.show();
    showEditTestimonyModal = (e, selectedTestimony, index) => {
        this.modal.current.show(selectedTestimony, index);
        e.preventDefault();
    }

    add = (fullname, jobPosition, image, content) => {
        this.props.addTestimonyIntoGroup(fullname, jobPosition, image, content);
        this.modal.current.hide();
    }
    update = (index, fullname, jobPosition, image, content) => {
        this.props.updateTestimonyInGroup(index, fullname, jobPosition, image, content);
        this.modal.current.hide();
    }
    remove = (e, index) => {
        this.props.removeTestimonyFromGroup(index);
        e.preventDefault();
    }
    swap = (e, index, isMoveUp) => {
        this.props.swapTestimonyInGroup(index, isMoveUp);
        e.preventDefault();
    }

    save = () => {
        const changes = {
            title: JSON.stringify({ vi: $('#tepViTitle').val(), en: $('#tepEnTitle').val() }),
            items: this.props.testimony.item.items,
        };
        this.props.updateTestimony(this.props.testimony.item._id, changes);
    }

    render() {
        let table = null,
            currentTestimony = this.props.testimony ? this.props.testimony.item : null;
        const _id = currentTestimony ? currentTestimony._id : null;
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');

        if (currentTestimony && currentTestimony.items.length > 0) {
            table = (
                <table className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: '80%' }}>Họ tên</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {!readOnly ? <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {currentTestimony.items.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    {readOnly ? <a>{T.language.parse(item.fullname, true).vi}</a> : <a href='#' onClick={e => this.showEditTestimonyModal(e, item, index)}>{T.language.parse(item.fullname, true).vi}</a>}
                                    <p>{T.language.parse(item.jobPosition, true).vi}</p>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image} style={{ width: '100%' }} />
                                </td>
                                {!readOnly ? <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showEditTestimonyModal(e, item, index)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có testimony!</p>;
        }

        const title = T.language.parse(currentTestimony && currentTestimony.title && currentTestimony.title != '' ? currentTestimony.title : '<empty>', true);
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-yelp' /> Testimony: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi }} />
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
                                <input className='form-control' type='text' placeholder='Tiêu đề' id='tepViTitle' defaultValue={title.vi} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                <label className='control-label'>Title</label>
                                <input className='form-control' type='text' placeholder='Title' id='tepEnTitle' defaultValue={title.en} readOnly={readOnly} />
                            </div>
                            <div className='form-group'>
                                {table}
                            </div>
                        </div>
                        {!readOnly ? <div className='tile-footer'>
                            <div className='row'>
                                <div className='col-md-12' style={{ textAlign: 'right' }}>

                                    <button className='btn btn-info' type='button' onClick={this.showAddTestimonyModal}>
                                        <i className='fa fa-fw fa-lg fa-plus'></i>Thêm testimony
                                    </button>
                                    &nbsp;

                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                        <i className='fa fa-fw fa-lg fa-save'></i>Lưu
                                    </button>
                                </div>
                            </div>
                        </div> : null}
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <TestimonyModal ref={this.modal} _id={_id} addTestimony={this.add} updateTestimony={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, testimony: state.testimony });
const mapActionsToProps = { getTestimonyItem, updateTestimony, addTestimonyIntoGroup, updateTestimonyInGroup, removeTestimonyFromGroup, swapTestimonyInGroup };
export default connect(mapStateToProps, mapActionsToProps)(TestimonyEditPage);