import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux';
import { Link } from 'react-router-dom';

class SectionNews extends React.Component {
    componentDidMount() {
        $(document).ready(() => {
            this.props.getNewsFeed(T.ftcoAnimate);
        })
    }

    render() {
        const newsFeed = this.props.news && this.props.news.newsFeed ? this.props.news.newsFeed : [];
        let news = null;
        if (newsFeed && newsFeed.length) {
            news = newsFeed.map((item, index) => {
                const link = item.link ? '/tintuc/' + item.link : '/news/' + item._id,
                    border = index < newsFeed.length - 1 ? 'border-bottom' : '';
                return (
                    <div key={index} className={'row ml-0 ftco-animate ' + border} style={{ paddingBottom: '30px', paddingTop: '15px' }} >
                        <div className='col-md-3'>
                            <div className={'blog_post_image'} ><img src={item && item.image ? item.image : ''} style={{ width: '100%' }} alt='' /></div>
                        </div>
                        <div className='col-md-9'>
                            <div className='text'>
                                <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                    <h6 className='heading pb-0 mb-0'>
                                        <Link to={link} style={{ color: '#4CA758' }}>{item.title}</Link>
                                    </h6>
                                    <div className='contact_content_text'>
                                        <p className='text-justify' >{item.abstract}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        return (
            <div className='services'>
                <h2 className='section_title'>Tin Tức Mới Nhất</h2>
                <div>{news}</div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);