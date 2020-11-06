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
  constructor(props) {
    super(props);
    this.state = {
      viewMode: 'list'
    }
  }

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
  // handleClickView = () => {
  //   (this.state.viewMode == 'list')
  //     ? this.setState({
  //       viewMode: 'grid'
  //     })
  //     : this.setState({
  //       viewMode: 'list'
  //     })
  // }
  setViewMode = (e, viewmode) => {
    this.setState({
      viewMode: viewmode
    })
  }
  render() {
    let userPage = this.props.news ? this.props.news.userPage : null,
      elements_grid = [],
      elements_list = [];
    if (userPage) {
      elements_grid = userPage.list.map((item, index) => {
        const link = item.link ? linkFormat + item.link : idFormat + item._id;
        return (
          <div className="col-md-6 col-lg-4 mb-2 mt-2" key={index}>
            <div className="post-entry h-100 single-popular-course mb-100">
              <div className="image">
                <Link to={link}>
                  <img src={item.image} alt="Image" className="img-fluid" style={{ width: '350px', height: 'auto' }} />
                </Link>
              </div>
              <div className="text p-4">
                <h2 className="h5 text-black"><Link to={link}>{T.language.parse(item.title)}</Link></h2>
                <span className="text-uppercase date d-block mb-3"><small>{new Date(item.createdDate).getText()}</small></span>
                <p className="mb-0 grid-abstract">{T.language.parse(item.abstract)}</p>
              </div>
            </div>
          </div>
        );
      });
      elements_list = userPage.list.map((item, index) => {
        const link = item.link ? linkFormat + item.link : idFormat + item._id;
        return (
          <div className='col-12' key={index}>
            <div className={'row view-list' + (index < userPage.list.length-1 ? ' border-bottom' : '')}>
              <div style={{ width: '150px', padding: '15px' }}>
                <Link to={link}>
                  <img src={`${item.image}`} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                </Link>
              </div>
              <div style={{ width: 'calc(100% - 150px)', paddingRight: '15px' }}>
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
      })
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
        <div className='mb-15' style={{ width: '100%' }}>
          <div className="btn-group" role="group">
            <button className={"btn btn-secondary btn-icon " + (this.state.viewMode == "list" ? "actived" : "")} onClick={(e) => this.setViewMode(e, "list")}><i class="fa fa-bars" aria-hidden="true"></i></button>
            <button className={"btn btn-secondary btn-icon " + (this.state.viewMode == "grid" ? "actived" : "")} onClick={(e) => this.setViewMode(e, "grid")}><i class="fa fa-th" aria-hidden="true"></i></button>
            {/* <button className='viewmode-btn' onClick={this.handleClickView}>{(this.state.viewMode == 'list') ? 'Grid view' : 'List View'}</button> */}
          </div>
        </div>
        <div className="row mb-5">
          {(this.state.viewMode == 'list') ? elements_list : elements_grid}
        </div>
      </section>
    );
  }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsInPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsListView);