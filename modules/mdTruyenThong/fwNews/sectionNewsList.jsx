import React from 'react';
import { connect } from 'react-redux';
import { getNewsPageByUser } from './redux';
import { Link } from 'react-router-dom';
import inView from 'in-view';

const linkFormat = '/tintuc/', idFormat = '/news/';

class SectionNewsList extends React.Component {
    state = {};
    loading = false;

    constructor(props) {
        super(props);
        this.state = {
            viewMode: (T.cookie('viewMode') ? T.cookie('viewMode') : 'grid')
        }
    }

    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let userPage = this.props.news.userPage;
            if (!this.loading && this.props.getNewsPageByUser && userPage && userPage.pageNumber < userPage.pageTotal) {
                this.loading = true;
                this.props.getNewsPageByUser(userPage.pageNumber + 1, T.defaultUserPageSize, () => this.loading = false);
            }
        });
    }

    componentDidMount() {
        this.props.getNewsPageByUser(1, T.defaultUserPageSize, () => this.loading = false);
    }

    setViewMode = (e, viewMode) => {
        e.preventDefault()
        this.setState({ viewMode: viewMode })
        T.cookie('viewMode', viewMode)
    }

    render() {
        let userPage = this.props.news ? this.props.news.userPage : null, elements = [];
        if (userPage) {
            elements = userPage.list.map((item, index) => {
                const link = item.link ? linkFormat + item.link : idFormat + item._id;
                return (
                    <div className='blog_post' key={index}>
                        <div className='blog_post_image'><img src={item && item.image ? item.image : ''} style={{ width: '100%' }} alt='' /></div>
                        <div className='blog_post_date d-flex flex-column align-items-center justify-content-center'>
                            <div className='date_day'>{new Date(item.createdDate).getDate()}</div>
                            <div className='date_month'>Tháng {new Date(item.createdDate).getMonth() + 1}</div>
                            <div className='date_year'>{new Date(item.createdDate).getFullYear()}</div>
                        </div>
                        <div className='blog_post_title'><Link to={link}>{item && item.title ? item.title : ''}</Link></div>
                        <div className='blog_post_info'>
                            <ul className='d-flex flex-row align-items-center justify-content-center'>
                                {/*<li><a href='#'>Admin</a></li>*/}
                            </ul>
                        </div>
                        <div className='blog_post_text text-center'>
                            <p>{item && item.abstract ? item.abstract : ''}</p>
                        </div>
                        <div className='blog_post_button text-center'><div className='button button_4 ml-auto mr-auto'><Link to={link}>Xem thêm</Link></div></div>
                    </div>
                );
            });
        }

        if (userPage && userPage.pageNumber < userPage.pageTotal) {
            elements.push(
                <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img alt='Loading' className='listViewLoading' src='/img/loading.gif'
                        style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
        }

        return (
            <div className='blog'>
                <div className='container'>
                    <div className='row'>
                        <div className='col'>
                            {elements}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionNewsList);