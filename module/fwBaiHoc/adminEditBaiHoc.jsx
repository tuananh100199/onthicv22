import React from 'react';
import { connect } from 'react-redux';
import { updateBaiHoc, getBaiHoc } from './redux.jsx'
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';

class adminEditBaiHoc extends React.Component {
    state = { item: null };
    editor = React.createRef();

    componentDidMount() {
        T.ready('/user/dao-tao', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:baihocId').parse(url);
            this.props.getBaiHoc(params.baihocId, data => {
                console.log(params.baihocId)
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                } else if (data.item) {
                    const item = data.item;
                    $('#title').val(item.title);
                    $('#shortDescription').val(item.shortDescription);
                    this.editor.current.html(item.detailDescription);
                    this.setState(data);
                    $('#title').focus();
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                }
            });
        });
    }
    save = () => {
        const changes = {
            title: $('#title').val().trim(),
            shortDescription: $('#shortDescription').val().trim(),
            detailDescription: this.editor.current.html(),
        };
        this.props.updateBaiHoc(this.state.item._id, changes)
    };
    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('lesson:write');
        const item = this.state.item ? this.state.item : {
            title: ''
        };
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Bài học: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: item.title != '' ? 'Tiêu đề: <b>' + item.title + '</b> ' : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/dao-tao/bai-hoc/list'>Danh sách tất cả bài học</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Tên bài học</label>
                                        <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                                    </div>
                                    {/* <div className='form-group col-sm-12 col-md-8 col-lg-6'>
                                        <label className='control-label'>Giá loại khóa học</label>
                                        <input className='form-control' type='number' placeholder='Giá loại khóa học' id='price' readOnly={readOnly} />
                                    </div> */}
                                </div>

                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Mô tả ngắn gọn</label>
                                        <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly}
                                            rows={2} />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Mô tả chi tiết </label>
                                        <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/user/dao-tao/bai-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
                {!readOnly &&
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, baihoc: state.baihoc });
const mapActionsToProps = { updateBaiHoc, getBaiHoc };
export default connect(mapStateToProps, mapActionsToProps)(adminEditBaiHoc);
