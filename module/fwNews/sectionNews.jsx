import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionNews extends React.Component {
    componentDidMount() {
        this.props.getNewsFeed();
    }

    render() {
        let num_news = 4;
        let news = null;
        if (this.props.news && this.props.news.newsFeed) {
            if(num_news >= this.props.news.newsFeed.length) num_news = this.props.news.newsFeed.length
            news = this.props.news.newsFeed.map((item, index) => {
                if (index < num_news) {
                    const link = item.link ? '/tintuc/' + item.link : '/news/item/' + item._id;
                    return (
                        <div key={index}>
                            <div className='row ml-0'>
                                <div style={{ width: '150px', padding: '15px 15px 15px 0px' }} className={((index < num_news - 1) ? ' border-bottom' : '')}>
                                    <Link to={link}>
                                        <img src={`${item.image}`} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                                    </Link>
                                </div>
                                <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={(index < num_news - 1 ? ' border-bottom' : '')}>
                                    <div className='text'>
                                        <div className='text-inner'>
                                            <h2 className='heading pb-0 mb-0'>
                                                <Link to={link} className='text-black news-title'>{T.language.parse(item.title)}</Link>
                                            </h2>
                                            <p className='news-abstract'>{T.language.parse(item.abstract)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
            })
        }
        return (
            <div className='mt-2'>
                <div className='text-left pl-4 mb-1 py-1' style={{ backgroundColor: '#4d983c' }}>
                    <h3 className='text-white'>Tin Tức Mới Nhất</h3>
                </div>
                <div>
                    {news}
                    {/*<button className='expand-btn' onClick={this.handleClickExpand}>*/}
                    {/*    {T.language.parse('{ "vi": "Xem thêm...", "en": "See more..." }')}*/}
                    {/*</button>*/}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);