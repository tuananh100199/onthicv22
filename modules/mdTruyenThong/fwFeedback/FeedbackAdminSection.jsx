import React from 'react';
import { connect } from 'react-redux';
import { getFeedbackPage, updateFeedback } from './redux';
import { TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class FeedbackSection extends React.Component {
    state = {};
    componentDidMount() {
        const { type, _refId } = this.props;
        this.props.getFeedbackPage(1, 50, { type, _refId });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.type != this.props.type) {
            const { type, _refId } = this.props;
            this.props.getFeedbackPage(1, 50, { type, _refId });
        }
    }
    edit = (e, item) => {
        e.preventDefault();
        !item.isSeen && this.props.updateFeedback(item._id, { isSeen: true });
        this.props.history.push(`${this.props.detailPageUrl}/${item._id}`);
    }

    render() {
        // const permission = this.getUserPermission('feedback');
        const { type, permission } = this.props;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.feedback && this.props.feedback.page ?
            this.props.feedback.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên học viên</th>
                    {type == 'teacher' ? <th style={{ width: 'auto' }} nowrap='true'>Họ và tên Giáo viên được phản hồi</th> : null}
                    <th style={{ width: 'auto' }} nowrap='true'>Thời gian</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Trạng thái</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> */}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} style={{ fontWeight: item.isSeen == true ? 'normal' : 'bold' }}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type={permission.write ? 'link' : 'text'} content={`${item.user && item.user.lastname} ${item.user && item.user.firstname}`} onClick={e => this.edit(e, item)} />
                    {type == 'teacher' ? <TableCell content={`${item._refId && item._refId.lastname} ${item._refId && item._refId.firstname}`} /> : null}
                    <TableCell content={T.dateToText(item.createdDate)} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.replies && item.replies.length ? 'Đã trả lời' : 'Chưa trả lời'} style={{ whiteSpace: 'nowrap' }} />
                    {/* <TableCell type='buttons' content={item} onEdit={this.edit} /> */}
                </tr>),
        });
        return <>
            {table}
            <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                getPage={this.props.getFeedbackPage} style={{ ...(this.props.type !== 'system' && { left: 320 }) }} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, feedback: state.communication.feedback });
const mapActionsToProps = { getFeedbackPage, updateFeedback };
export default connect(mapStateToProps, mapActionsToProps)(FeedbackSection);