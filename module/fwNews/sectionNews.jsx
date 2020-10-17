import React from 'react';
import { connect } from 'react-redux';
import { getNewsFeed } from './redux.jsx';
import { Link } from 'react-router-dom';

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

  render() {
    const language = T.language(texts);
    let title = language.noNewsTitle,
      news = null;
    if (this.props.news && this.props.news.newsFeed) {
      if (this.props.news.newsFeed.length > 0) title = language.newsTitle;
      news = this.props.news.newsFeed.map((item, index) => {
        const link = item.link ? '/tintuc/' + item.link : '/news/item/' + item._id;
        return (
          <div className='item' key={index}>
            <div className='block-12'>
              <Link to={link}>
                <figure>
                  <img src={`${item.image}`} style={{ height: '300px' }} alt='Image' className='img-fluid' />
                </figure>
              </Link>
              <div className='text'>
                <span className='meta'>{new Date(item.createdDate).getText()}</span>
                <div className='text-inner'>
                  <h2 className='heading mb-3'><Link to={link} className='text-black'>{T.language.parse(item.title)}</Link></h2>
                  <p>{T.language.parse(item.abstract)}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })
    }
    return (
      <div className="site-section block-13 bg-primary fixed overlay-primary bg-image" style={{ backgroundImage: 'url("img/hero_bg_3.jpg")' }} data-stellar-background-ratio="0.5" >
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-12 text-center">
              <h2 className="text-white">{T.language.parse('{ "vi": "Tin Tức Mới Nhất", "en": "Latest News" }')}</h2>
            </div>
          </div>
          <div className="row">
            <div className="nonloop-block-13 owl-carousel">
              {news}
            </div >
          </div>
        </div>
      </div >
    )
  }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsFeed };
export default connect(mapStateToProps, mapActionsToProps)(SectionNews);