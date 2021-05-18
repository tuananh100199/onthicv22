import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux';
import { Link } from 'react-router-dom';

class SectionNews extends React.Component {
    state = {}
    componentDidMount() {
        $(document).ready(() => {
            this.props.getNewsFeed(T.ftcoAnimate);
        });
        $(window).on('resize', this.handleResize);
    }
    handleResize = () => {
        this.setState({ viewport: $('.services').width() > 768 ? 'big' : 'small' });
        T.ftcoAnimate();
    }

    render() {
        const newsFeed = this.props.news && this.props.news.newsFeed ? this.props.news.newsFeed : [];
        return (
            <div className='services' >
                <h2 className='section_title'>Tin Tức Mới Nhất</h2>
                <div>{this.state.viewport == 'big' ?
                    (<div className='row pt-5'>
                        {newsFeed.map((item, index) => (
                            <div key={index} className='team_col ftco-animate col-md-4' style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                                <div className='team_item text-center d-flex flex-column align-items-center justify-content'>
                                    <div className='team_image' ><Link to={item.link ? '/tintuc/' + item.link : '/news/' + item._id} style={{ color: '#4CA758' }}><img style={{ objectFit: 'cover', width: '100%', height: '150px' }} src={item.image} alt='lastnews' /></Link></div>
                                    <div className='team_content text-center'>
                                        <div className='team_name'>
                                            <Link to={item.link ? '/tintuc/' + item.link : '/news/' + item._id} style={{ color: '#4CA758' }}>{item.title}</Link>
                                        </div>
                                        <div className='team_text'>
                                            <blockquote>
                                                <p>&ldquo;{item.abstract}&rdquo;</p>
                                            </blockquote>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                        }
                    </div >) :
                    <div className='pt-5'>
                        {
                            <div id='carouselLastNews' className='carousel slide ftco-animate' data-ride='carousel' data-interval='5000' style={{ height: 'auto' }}>
                                <div className='carousel-inner'>
                                    {newsFeed.map((item, index) => (
                                        <div className={'team_col carousel-item' + (index == 0 ? ' active' : '')}
                                            key={index}>
                                            <div className='team_item text-center d-flex flex-column align-items-center justify-content'>
                                                <div className='team_image'><Link to={item.link ? '/tintuc/' + item.link : '/news/' + item._id} style={{ color: '#4CA758' }}><img style={{ objectFit: 'cover', width: '100%', height: '200px' }} src={item.image} alt='lastnews' /></Link></div>
                                                <div className='team_content text-center'>
                                                    <div className='team_name'>
                                                        <Link to={item.link ? '/tintuc/' + item.link : '/news/' + item._id} style={{ color: '#4CA758' }}>{item.title}</Link>
                                                    </div>
                                                    <div className='team_text'>
                                                        <blockquote>
                                                            <p>&ldquo;{item.abstract}&rdquo;</p>
                                                        </blockquote>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <a className='carousel-control-prev' href='#carouselLastNews' role='button' data-slide='prev' style={{ opacity: 1 }}>
                                    <span className='carousel-control-prev-icon' />
                                    <span className='sr-only'>Previous</span>
                                </a>
                                <a className='carousel-control-next' href='#carouselLastNews' role='button' data-slide='next' style={{ opacity: 1 }}>
                                    <span className='carousel-control-next-icon' />
                                    <span className='sr-only'>Next</span>
                                </a>
                            </div>
                        }
                    </div >
                }</div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.communication.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);