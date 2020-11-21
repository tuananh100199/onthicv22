import React from 'react';
import { connect } from 'react-redux';
import { getAllContents, createContent, updateContent, deleteContent } from './redux/reduxContent.jsx';
import { Link } from 'react-router-dom';

class ContentPage extends React.Component {
    componentDidMount() {
        this.props.getAllContents();
    }

    create = (e) => {
        console.log("this.props.history", this.props.history)
        this.props.createContent(data => this.props.history.push('/user/content/edit/' + data.item._id));
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Xóa nội dung', 'Bạn có chắc bạn muốn xóa nội dung này?', true, isConfirm => isConfirm && this.props.deleteContent(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null,
            items = this.props.content ? this.props.content : null;
        if (items && items.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }} >Kích hoạt</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/content/edit/' + item._id} data-id={item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => !readOnly && this.props.updateContent(item._id, { active: item.active ? 0 : 1 })} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/content/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('component:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } else {
            table = <p key={0}>Không có nội dung nào cả!</p>;
        }

        return currentPermissions.contains('component:write') ? [
            table,
            <button key={1} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                <i className='fa fa-lg fa-plus' />
            </button>
        ] : table;
    }
}

const mapStateToProps = state => ({ system: state.system, content: state.content });
const mapActionsToProps = { getAllContents, createContent, updateContent, deleteContent };
export default connect(mapStateToProps, mapActionsToProps)(ContentPage);