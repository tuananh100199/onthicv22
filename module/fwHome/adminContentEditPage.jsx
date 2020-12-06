import React from 'react';
import { connect } from 'react-redux';
import { getContent, updateContent } from './redux/reduxContent.jsx';
import { Link } from 'react-router-dom';
import ImageBox from '../../view/component/ImageBox.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

class ContentEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/component', () => {
            $('#cntViTitle').focus();

            const route = T.routeMatcher('/user/content/edit/:contentId'),
                params = route.parse(window.location.pathname);
            this.props.getContent(params.contentId, data => {
                if (data.error) {
                    T.notify('Lấy bài viết bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    data.image = data.item.image ? data.item.image : '/image/avatar.jpg';
                    this.imageBox.current.setData('content:' + (data.item._id ? data.item._id : 'new'));
                    const title = T.language.parse(data.item.title, true),
                        content = T.language.parse(data.item.content, true);

                    $('#cntViTitle').val(title.vi).focus();
                    $('#cntEnTitle').val(title.en).focus();
                    this.viEditor.current.html(content.vi);
                    this.enEditor.current.html(content.en);
                    this.setState(data);
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { active: event.target.checked }) });
    }
    save = () => {
        const changes = {
            title: JSON.stringify({ vi: $('#cntViTitle').val(), en: $('#cntEnTitle').val() }),
            content: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
            active: this.state.item.active,
        };

        this.props.updateContent(this.state._id, changes);
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        const title = this.state.item.title ? T.language.parse(this.state.item.title, true) : { en: '<empty>', vi: '<Trống>' };
        const image = this.state.item.image ? this.state.item.image : T.url('/image/avatar.jpg');
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-image' /> Bài viết: Chỉnh sửa</h1>
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
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Hình ảnh</h3>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='col-md-6'>
                                        <div className='form-group'>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ContentImage' image={image} readOnly={!currentPermissions.includes('component:write')} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#contentViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#contentEnTab'>English</a>
                                </li>
                                <div className='form-group' style={{ whiteSpace: 'nowrap', position: 'absolute', right: '10px' }}>
                                    <label className='control-label'>Kích hoạt: &nbsp;&nbsp;&nbsp;</label>
                                    <label className='toggle'>
                                        <input type='checkbox' checked={this.state.item.active} onChange={(e) => !readOnly && this.changeActive(e)} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </ul>

                            <div className='tab-content'>
                                <div id='contentViTab' className='tab-pane fade show active'>
                                    <div className='form-group'>
                                        <label className='control-label'>Tiêu đề</label>
                                        <input className='form-control' type='text' placeholder='Tiêu đề' id='cntViTitle' defaultValue={this.state.item.title} readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label className='control-label'>Nội dung</label>
                                        <Editor ref={this.viEditor} placeholder='Nội dung bài biết' height='400px' uploadUrl='/user/upload?category=content' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div id='contentEnTab' className='tab-pane fade'>
                                    <div className='form-group'>
                                        <label className='control-label'>Title</label>
                                        <input className='form-control' type='text' placeholder='Title' id='cntEnTitle' defaultValue={this.state.item.title} readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label className='control-label'>Content</label>
                                        <Editor ref={this.enEditor} placeholder='Content' height='400px' uploadUrl='/user/upload?category=content' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {readOnly ? null :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, content: state.content });
const mapActionsToProps = { getContent, updateContent };
export default connect(mapStateToProps, mapActionsToProps)(ContentEditPage);