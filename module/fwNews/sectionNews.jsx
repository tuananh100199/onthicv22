import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionNews extends React.Component {
    componentDidMount() {
        this.props.getNewsFeed();
    }

    render() {
        const newsFeed = this.props.news && this.props.news.newsFeed ? this.props.news.newsFeed : [];
        let news = null;
        if (newsFeed && newsFeed.length) {
            news = newsFeed.map((item, index) => {
                const link = item.link ? '/tintuc/' + item.link : '/news/item/' + item._id;
                return (
                    <div key={index}>
                        <div className='row ml-0'>
                            <div style={{ width: '150px', padding: '15px 15px 15px 0px' }} className={index < newsFeed.length - 1 ? 'border-bottom' : ''}>
                                <Link to={link}>
                                    <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                                </Link>
                            </div>
                            <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={index < newsFeed.length - 1 ? 'border-bottom' : ''}>
                                <div className='text'>
                                    <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                        <h2 className='heading pb-0 mb-0'>
                                            <Link to={link} className='text-black'>{T.language.parse(item.title)}</Link>
                                        </h2>
                                        <p style={{ fontSize: '13px', height: '75px', overflow: 'hidden' }}>{T.language.parse(item.abstract)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        return (
            <div className='mt-2'>
                <h3>Tin Tức Mới Nhất</h3>
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