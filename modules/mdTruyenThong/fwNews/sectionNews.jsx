import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux';
import { Link } from 'react-router-dom';
import './style.css';

const newsTypeList = [
    {
        title:'Tin tức giao thông',
        image:'/img/traffic.jpg',
        link:'/news',
        abstract:'Các tin tức trong ngày được chúng tôi cập nhật sớm nhất tại đây.'
    },
    {
        title:'Quy định pháp luật',
        image:'/img/law.jpg',
        link:'',
        abstract:'Các quy định mà nhà nước ban hành, thông tư mới nhất về luật an toàn giao thông.',
    },{
        title:'Câu hỏi thường gặp',
        image:'/img/faq.jpg',
        link:'/faq',
        abstract:'Câu hỏi mà học viên thường hay thắc mắc sẽ chúng tối giải đáp 1 cách cụ thể nhất.',
    }
];
class SectionNews extends React.Component {
    state = {}
    componentDidMount() {
        $(document).ready(() => {
            this.props.getNewsFeed(()=>{
                T.ftcoAnimate();
                $(window).on('resize', this.handleResize);
                $('#newCarousel').owlCarousel({
                    items:1,
                    loop:true,
                    margin:10,
                    autoplay: true,
                    smartSpeed:600,
                    autoplayTimeout:3000,
                    autoplayHoverPause: true,
                    dots:true,
                    nav:true,
                    navText: ['<i class="fa fa-chevron-left" aria-hidden="true"></i>','<i class="fa fa-chevron-right" aria-hidden="true"></i>'],
                });
            });

            // $(window).trigger('resize');
        });
        
        
        
    }
    handleResize = () => {
        this.setState({ viewport: $('.services').width() > 768 ? 'big' : 'small' });
        T.ftcoAnimate();
    }

    renderTypeItem = (item,index)=>(
        <div key={index} className='team_col ftco-animate col-md-4'>
            <div className='wrap_item'>
                <div className='team_item text-center d-flex flex-column align-items-center justify-content' style={{ borderRadius: '25px' }}>
                    <Link className='news_link' to={item.link} style={{ color: '#4CA758' }}>
                        <div className="news_image">
                            <img src={item.image} alt='image' />
                        </div>
                        {/* <div className='news_image' style={{backgroundImage: 'url(' + item.image + ')',}}></div> */}

                    </Link>
                    
                    <div className='team_content text-center news_content'>
                        <div className='news_content_title'>
                            <h5>
                            <Link to={item.link}>{item.title}</Link>
                            </h5>
                        </div>
                        <div className='news_content_text'>
                            <blockquote>
                                <p>&ldquo;{item.abstract}&rdquo;</p>
                            </blockquote>
                        </div>
                        <div className='text-align-center'>
                        <a href={item.link} className="link_watch_more text-main">Xem thêm</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    render() {
        const newsFeed = this.props.news && this.props.news.newsFeed ? this.props.news.newsFeed : [];
        return (

            <div className='services news'>
                <div className='container' >
                    <div className='news_title'>
                        <h3 className='text-title text-main'>Những điều cần biết</h3>
                    </div>
                </div>
                    
                    <div className="container news_pc">
                        <div className='row' style={{ margin: 'auto'}}>
                            {
                                newsTypeList.map((item,index)=>this.renderTypeItem(item,index))
                            }
                        </div >
                    </div>
                    <div className='news_mobile'>
                            <div className="owl-carousel news_carousel carousel_nav carousel_dots" id='newCarousel'>
                                {newsFeed.map((item, index) => (
                                        <div key={index} className='item team_col'>
                                            <div className='team_item d-flex flex-column'>
                                            <div className="container-fluid" style={{flex:'auto'}}>
                                                <div className='team_content  d-flex flex-column justify-content-between'>
                                                    <div className='team_name'>
                                                        <Link to={item.link ? '/tintuc/' + item.link : '/news/' + item._id}>{item.title}</Link>
                                                    </div>
                                                    <div className='team_text'>
                                                        <blockquote>
                                                            <p>&ldquo;{item.abstract}&rdquo;</p>
                                                        </blockquote>
                                                    </div>
                                                    <div>
                                                        <a href={item.link ? '/tintuc/' + item.link : '/news/' + item._id} className="link_watch_more text-main">Xem thêm</a>
                                                    </div>
                                                </div>
                                                
                                            </div>

                                            <div className='news_image' >
                                                <Link to={item.link ? '/tintuc/' + item.link : '/news/' + item._id} style={{ color: '#4CA758' }}><img src={item.image} alt='lastnews' /></Link>
                                            </div>
                                            </div>
                                        </div>
                                        
                                    ))}
                            </div>

                    </div >
            </div>
            
        );
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.communication.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);
