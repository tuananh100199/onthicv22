import React from 'react';
import { connect } from 'react-redux';
import { getContentAll, createContent, updateContent, deleteContent } from './redux/reduxContent';
import { CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class ContentView extends React.Component {
    componentDidMount() {
        this.props.getContentAll();
    }

    create = (e) => e.preventDefault() || this.props.createContent(data => this.props.history.push('/user/content/edit/' + data.item._id));

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nội dung', 'Bạn có chắc bạn muốn xóa nội dung này?', true, isConfirm =>
        isConfirm && this.props.deleteContent(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.content && this.props.component.content.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/content/edit/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateContent(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/content/edit/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getContentAll, createContent, updateContent, deleteContent };
export default connect(mapStateToProps, mapActionsToProps)(ContentView);
