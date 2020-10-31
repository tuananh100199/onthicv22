import React from 'react';
import { connect } from 'react-redux';
import { getNewsInPageByUser } from './redux.jsx';
import { Link } from 'react-router-dom';
import inView from 'in-view';

const linkFormat = '/tintuc/',
  idFormat = '/news/item/';

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

class NewsListView extends React.Component {
  state = {};
  loading = false;

  componentDidMount() {
    this.props.getNewsInPageByUser(1, T.defaultUserPageSize, () => this.loading = false);
  }

  componentDidUpdate() {
    setTimeout(T.ftcoAnimate, 250);
  }

  ready = () => {
    inView('.listViewLoading').on('enter', () => {
      let userPage = this.props.news.userPage;
      if (!this.loading && this.props.getNewsInPageByUser && userPage && userPage.pageNumber < userPage.pageTotal) {
        this.loading = true;
        this.props.getNewsInPageByUser(userPage.pageNumber + 1, T.defaultUserPageSize, () => this.loading = false);
      }
    });
  }

  render() {
    let userPage = this.props.news ? this.props.news.userPage : null,
      elements = [];
    if (userPage) {
      elements = userPage.list.map((item, index) => {
        const link = item.link ? linkFormat + item.link : idFormat + item._id;
        return (
          <div className="col-md-6 col-lg-4 mb-4" key={index}>
            <div className="post-entry h-100">
              <div className="image">
                <img src={item.image} alt="Image" className="img-fluid" style={{ width: '256px', height: '215PX' }} />
              </div>
              <div className="text p-4">
                <h2 className="h5 text-black"><Link to={link}>{T.language.parse(item.title)}</Link></h2>
                <span className="text-uppercase date d-block mb-3"><small>{new Date(item.createdDate).getText()}</small></span>
                <p className="mb-0">{T.language.parse(item.abstract)}</p>
              </div>
            </div>
          </div>
        );
      });
    }
    

    if (userPage && userPage.pageNumber < userPage.pageTotal) {
      elements.push(
        <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
          <img className='listViewLoading' src='/img/loading.gif' style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
        </div>
      );
    }

    return (
      <section>
        <div className="site-blocks-cover overlay" style={{ backgroundImage: 'url(img/hero_bg_3.jpg)' }} data-aos="fade" data-stellar-background-ratio="0.5">
          <div className="container">
            <div className="row align-items-center justify-content-start">
              <div className="col-md-6 text-center text-md-left" data-aos="fade-up" data-aos-delay={400}>
                <h1 className="bg-text-line">{T.language.parse('{ "vi": "Tin tức", "en": "News" }')}</h1>
                {/* <p className="mt-4">Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad maxime velit nostrum praesentium voluptatem. Mollitia perferendis dolore dolores.</p> */}
              </div>
            </div>
          </div>
        </div>
        <div className="site-section">
          <div className="container">
            <div className="row mb-5">
              {elements}
            </div>
          </div>
        </div>
      </section>
    );
  }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsInPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsListView);