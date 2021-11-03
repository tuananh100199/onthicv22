import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
import { Link } from 'react-router-dom';

class SectionForumCategory extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getForumCategories(this.props.course);
        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    render() {
        return this.props.forum ? <>
            {(this.props.forum.categories || []).map((category, index) => {
                const forums = [];
                for (let i = 0; i < Math.min(3, category.page && category.page.list ? category.page.list.length : 0); i++) {
                    const forumItem = category.page.list[i];
                    forums.push(<li key={i} style={{ marginBottom: 12 }}><Link to={`/user/forum/message/${forumItem._id}`} style={{ color: 'black' }}>{forumItem.title}</Link></li>);
                }

                return (
                    <div key={index} className='tile'>
                        <div className='row'>
                            <div className='col-md-2'>
                                <Link to={`/user/forum/${category._id}`}>
                                    <img src={category.image} style={{ width: '100%', height: 'auto' }} />
                                </Link>
                            </div>
                            <div className='col-md-10'>
                                <Link to={`/user/forum/${category._id}`}>
                                    <h3 className='tile-title'>{category.title}</h3>
                                </Link>
                                <p style={{ position: 'absolute', top: 0, right: 12 }}>{category.total ? `Có ${category.total} bài viết.` : ''}</p>
                                {forums.length ? <ol>{forums}</ol> : 'Chưa có bài viết!'}
                            </div>
                        </div>
                    </div>);
            })}
        </> : '...';
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumCategories };
export default connect(mapStateToProps, mapActionsToProps)(SectionForumCategory);