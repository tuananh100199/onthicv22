import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class CategoryPage extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getForumCategories();
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-comments',
            title: 'Forum',
            breadcrumb: ['Forum'],
            content: this.props.forum ? <>
                {(this.props.forum.categories || []).map((category, index) => {
                    const forums = category.page && category.page.length ? [] : 'Chưa có bài viết!';
                    for (let i = 0; i < Math.min(3, category.page ? category.page.length : 0); i++) {
                        const forumItem = category.page[i];
                        forums.push(<li key={i}>TODO: {forumItem.title}</li>);
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
                                    {forums}
                                </div>
                            </div>
                        </div>);
                })}
            </> : '...',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumCategories };
export default connect(mapStateToProps, mapActionsToProps)(CategoryPage);