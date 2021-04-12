import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from 'modules/mdTruyenThong/fwNews/redux';
import { Link } from 'react-router-dom';

class NewsFeed extends React.Component {
    componentDidMount() {
        this.props.getNewsFeed(() => {
            T.ftcoAnimate()
        });
    }

    render() {
        const newsFeed = this.props.news && this.props.news.newsFeed ? this.props.news.newsFeed : [];
        let news = null;
        if (newsFeed && newsFeed.length) {
            news = newsFeed.map((item, index) => {
                const link = item.link ? '/tintuc/' + item.link : '/news/' + item._id;
                return (
                    <div key={index} className='ftco-animate blog_post'>
                        <div className='blog_post_image'><img src={item && item.image ? item.image : ''} style={{ width: '100%' }} alt='' /></div>
                        <div className='blog_post_date d-flex flex-column align-items-center justify-content-center'>
                            <div className='date_day'>{new Date(item.createdDate).getDate()}</div>
                            <div className='date_month'>Tháng {new Date(item.createdDate).getMonth() + 1}</div>
                            <div className='date_year'>{new Date(item.createdDate).getFullYear()}</div>
                        </div>
                        <div className='blog_post_title'><Link to={link}>{item && item.title ? item.title : ''}</Link></div>
                        <div className='blog_post_text text-center'>
                            <p>{item && item.abstract ? item.abstract : ''}</p>
                        </div>
                        <div className='blog_post_button text-center'><div className='button button_4 ml-auto mr-auto'><Link to={link}>Xem thêm</Link></div></div>
                    </div>
                )
            })
        }
        return (
            <div className='contact_form_container'>
                <div className='contact_form_title'>Tin tức mới nhất</div>
                <div>{news}</div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ news: state.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(NewsFeed);
