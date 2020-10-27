import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux.jsx';
import { Link } from 'react-router-dom';
import fwNews from './index.jsx';

const texts = {
  vi: {
    noNewsTitle: 'Không có tin tức',
    newsTitle: 'Tin tức mới',
    view: 'Lượt xem',
  },
  en: {
    noNewsTitle: 'No latest news!',
    newsTitle: 'Latest news',
    view: 'View'
  }
};

class SectionNews extends React.Component {
  componentDidMount() {
    this.props.getNewsFeed();
  }

  componentDidUpdate() {
    $(document).ready(() => {
      setTimeout(() => {
        T.ftcoAnimate
        var siteCarousel = function () {
          if ($('.nonloop-block-13').length > 0) {
            $('.nonloop-block-13').owlCarousel({
              center: false,
              items: 1,
              loop: false,
              stagePadding: 0,
              margin: 20,
              nav: true,
              navText: ['<span class="icon-arrow_back">', '<span class="icon-arrow_forward">'],
              responsive: {
                600: {
                  margin: 0,
                  stagePadding: 10,
                  items: 2
                },
                1000: {
                  margin: 0,
                  stagePadding: 0,
                  items: 2
                },
                1200: {
                  margin: 0,
                  stagePadding: 0,
                  items: 3
                }
              }
            });
          }
        };
        siteCarousel();
      }, 250);
    })
  }

  handleClickExpand = () => {
    console.log(this.props.news)

  }

  render() {
    const language = T.language(texts);
    let title = language.noNewsTitle,
      news = null;
    if (this.props.news && this.props.news.newsFeed) {
      if (this.props.news.newsFeed.length > 0) title = language.newsTitle;
      news = this.props.news.newsFeed.map((item, index) => {
        if (index < 4) {
          const link = item.link ? '/tintuc/' + item.link : '/news/item/' + item._id;
          return (
            <div className='item ' key={index}>
              <div className='block-12'>
                <Link to={link} >
                  <figure className=''>
                    <img src={`${item.image}`} style={{ height: '95px', width: '130px' }} alt='Image' className='img-fluid float-left' />
                  </figure>
                </Link>
                <div className='text border-bot'>
                  {/* <span className='meta'>{new Date(item.createdDate).getText()}</span> */}
                  <div className='text-inner'>
                    <h2 className='heading pb-0 mb-0'><Link to={link} className='text-black news-title'>{T.language.parse(item.title)}</Link></h2>
                    <p className='news-abstract'>{T.language.parse(item.abstract)}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      })
    }
    return (
      <div className="site-section block-13 fixed overlay-primary bg-image width-news" style={{ backgroundImage: 'url("img/hero_bg_3.jpg")' }} data-stellar-background-ratio="0.5" >
        <div className="container margin-bot">
          <div className="row col-12 col-md-8">
            <div className="col-md-12 news-header">
              <h2 className="text-white">{T.language.parse('{ "vi": "Tin Tức Mới Nhất", "en": "Latest News" }')}</h2>
            </div>
          </div>
          <div className="row news-scroll col-12 col-md-8">
            {/* <div className="nonloop-block-13 owl-carousel"> */}
            <div className="">
              {news}
            </div >
            {/* <button className='expand-btn' onClick={this.handleClickExpand}>
              {T.language.parse('{ "vi": "Xem thêm...", "en": "See more..." }')}
            </button> */}
          </div>
        </div>
      </div >
    )
  }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);