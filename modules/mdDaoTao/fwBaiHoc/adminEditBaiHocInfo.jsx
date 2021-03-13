import React from 'react';
import { connect } from 'react-redux';
import { updateBaiHoc, getBaiHoc } from './redux/redux';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

class adminEditBaiHoc extends React.Component {
    state = { item: null };
    editor = React.createRef();
    componentDidMount() {
        T.ready('/user/dao-tao/bai-hoc/list', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:baihocId').parse(url);
            this.props.getBaiHoc(params.baihocId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
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
        return (
            <div>
                <div className='tile-body'>
                    <div className='form-group'>
                        <label className='control-label'>Tên bài học</label>
                        <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                    </div>
                    <div className='form-group'>
                        <label className='control-label'>Mô tả ngắn gọn</label>
                        <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly} rows={2} />
                    </div>
                    <div className='form-group'>
                        <label className='control-label'>Mô tả chi tiết </label>
                        <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                    </div>
                </div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-primary' onClick={this.save}>
                        <i className='fa fa-lg fa-save' /> Lưu
                    </button>
                </div>
                <Link to='/user/dao-tao/bai-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>

            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, baihoc: state.baihoc, question: state.question });
const mapActionsToProps = { updateBaiHoc, getBaiHoc };
export default connect(mapStateToProps, mapActionsToProps)(adminEditBaiHoc);
