import React from 'react';
import { connect } from 'react-redux';
import { getNewsInPageByUser } from './redux.jsx';
import { Link } from 'react-router-dom';
import inView from 'in-view';
import T from '../../view/js/common.js';

const linkFormat = '/tintuc/', idFormat = '/news/item/';

class NewsListView extends React.Component {
  state = {};
  loading = false;

  constructor(props) {
    super(props);
    this.state = {
      viewMode: (T.getCookie('viewMode').slice(1, T.getCookie('viewMode').length - 1) == '' ? T.defaultViewMode : T.getCookie('viewMode').slice(1, T.getCookie('viewMode').length - 1)) //TODO: Cookie
    }
  }

  componentDidMount() {
    this.props.getNewsInPageByUser(1, T.defaultUserPageSize, () => this.loading = false);
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

  setViewMode = (e, viewMode) => {
    e.preventDefault()
    this.setState({ viewMode: viewMode })
    T.cookie('viewMode', viewMode)
  }

  render() {
    let userPage = this.props.news ? this.props.news.userPage : null,
      elements_grid = [],
      elements_list = [];
    if (userPage) {
      elements_grid = userPage.list.map((item, index) => {
        const link = item.link ? linkFormat + item.link : idFormat + item._id;
        return (
          <div className='col-md-6 col-lg-4 mb-2 mt-2' key={index}>
            <div className='post-entry h-100 single-popular-course mb-100'>
              <div className='image'>
                <Link to={link}>
                  <img src={item.image} alt='Image' className='img-fluid'
                    style={{ width: '350px', height: 'auto' }} />
                </Link>
              </div>
              <div className='text p-4'>
                <h2 className='h5 text-black'><Link to={link}>{T.language.parse(item.title)}</Link></h2>
                <span className='text-uppercase date d-block mb-3'><small>{new Date(item.createdDate).getText()}</small></span>
                <p className='mb-0 grid-abstract'>{T.language.parse(item.abstract)}</p>
              </div>
            </div>
          </div>
        );
      });
      elements_list = userPage.list.map((item, index) => {
        const link = item.link ? linkFormat + item.link : idFormat + item._id;
        return (
          <div className='col-12' key={index}>
            <div className='row'>
              <div style={{ width: '150px', padding: '15px' }} className={(index < userPage.list.length - 1 ? 'border-bottom' : '')}>
                <Link to={link}>
                  <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                </Link>
              </div>
              <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }}
                className={(index < userPage.list.length - 1 ? ' border-bottom' : '')}>
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

    if (userPage && userPage.pageNumber < userPage.pageTotal) {
      elements.push(
        <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
          <img alt='Loading' className='listViewLoading' src='/img/loading.gif' style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
        </div>
      );
    }

    return (
      < section >
        <div className='mb-15 text-right'>
          <div className='btn-group'>
            <button
              className={'btn btn-sm ' + (this.state.viewMode == 'list' ? ' btn-primary' : 'btn-secondary')}
              onClick={(e) =>
                this.setViewMode(e, 'list')
              }><i className='fa fa-bars' aria-hidden='true' />
            </button>
            <button
              className={'btn btn-sm ' + (this.state.viewMode == 'grid' ? 'btn-primary' : 'btn-secondary')}
              onClick={
                (e) => this.setViewMode(e, 'grid')
              }><i className='fa fa-th' aria-hidden='true' />
            </button>
          </div>
        </div>
        <div className='row mb-5'>
          {(this.state.viewMode == 'list') ? elements_list : elements_grid}
        </div>
      </ section >
    );
  }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsInPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(NewsListView);