import React from 'react';
import { connect } from 'react-redux';
import { getContent, updateContent } from './redux/reduxContent.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

class ContentEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { _id: null, title: '', active: false, content: '' };
        this.imageBox = React.createRef();
        this.editor = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/component', () => {
            const route = T.routeMatcher('/user/content/edit/:contentId'),
                params = route.parse(window.location.pathname);
            this.props.getContent(params.contentId, data => {
                if (data.error) {
                    T.notify('Lấy bài viết bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const { _id, title, abstract, content, image = '/img/avatar.jpg' } = data.item;
                    $('#cntTitle').val(title).focus();
                    $('#cntAbstract').val(abstract);
                    this.editor.current.html(content);
                    this.imageBox.current.setData('content:' + _id, image);
                    this.setState(data.item);
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    changeActive = (event) => {
        this.setState({ active: event.target.checked });
    }
    save = () => {
        const changes = {
            title: $('#cntTitle').val().trim(),
            abstract: $('#cntAbstract').val(),
            content: this.editor.current.html(),
            active: this.state.active ? 1 : 0,
        };

        this.props.updateContent(this.state._id, changes);
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        const title = this.state.title ? this.state.title : '<Trống>';
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-image' /> Bài viết: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='col-12 col-md-8'>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='cntTitle'>Tiêu đề</label>
                                    <input className='form-control' type='text' placeholder='Tiêu đề' id='cntTitle' readOnly={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='cntAbstract'>Mô tả ngắn</label>
                                    <input className='form-control' type='text' placeholder='Mô tả ngắn' id='cntAbstract' readOnly={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Kích hoạt: &nbsp;&nbsp;&nbsp;</label>
                                    <label className='toggle'>
                                        <input type='checkbox' checked={this.state.active} onChange={(e) => !readOnly && this.changeActive(e)} />
                                        <span className='button-indecator' />
                                    </label>
                                </div>
                            </div>
                            <div className='col-12 col-md-4'>
                                <div className='form-group'>
                                    <label className='control-label'>Hình ảnh</label>
                                    <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ContentImage' readOnly={!currentPermissions.includes('component:write')} />
                                </div>
                            </div>
                        </div>
            
                        <div className='tab-content'>
                            <div id='contentTab' className='tab-pane fade show active'>
                                
                                <div className='form-group'>
                                    <label className='control-label'>Nội dung</label>
                                    <Editor ref={this.editor} placeholder='Nội dung bài biết' height='400px' uploadUrl='/user/upload?category=content' readOnly={readOnly} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <a className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }} onClick={() => { window.history.back(); }}>
                    <i className='fa fa-lg fa-reply' style={{ color: 'white' }} />
                </a>

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
