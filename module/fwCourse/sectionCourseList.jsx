import React from 'react';
import { connect } from 'react-redux';
import { getCourseInPageByUser } from './redux.jsx';
import { Link } from 'react-router-dom';
import inView from 'in-view';

const linkFormat = '/khoahoc/', idFormat = '/course/item/';

class CourseListView extends React.Component {
    state = {};
    loading = false;
    
    constructor(props) {
        super(props);
        this.state = {
            viewMode: 'list' 
        }
    }
    
    componentDidMount() {
        this.props.getCourseInPageByUser(1, T.defaultUserPageSize, () => this.loading = false);
    }
    
    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let userPage = this.props.course.userPage;
            if (!this.loading && this.props.getCourseInPageByUser && userPage && userPage.pageNumber < userPage.pageTotal) {
                this.loading = true;
                this.props.getCourseInPageByUser(userPage.pageNumber + 1, T.defaultUserPageSize, () => this.loading = false);
            }
        });
    }
    
    setViewMode = (e, viewMode) => {
        e.preventDefault()
        this.setState({ viewMode })
    }
    
    render() {
        let userPage = this.props.course ? this.props.course.userPage : null,
            elements_grid = [],
            elements_list = [];
        if (userPage) {
            elements_grid = userPage.list.map((item, index) => {
                const link = item.link ? linkFormat + item.link : idFormat + item._id;
                return (
                    <div className="col-lg-6 d-flex ftco-animate" key={index} style={{ opacity: 1, visibility: 'visible'}}> 
                        <div className="dept d-md-flex">
                            <Link to={link} className="img" style={{ backgroundImage: 'url(' + item.image + ')'}}></Link>
                            <div className="text p-4">
                            <h3 className='h5'><Link to={link} className='text-primary'>{item.title}</Link></h3>
                                {/* <p><span className="loc">{item.address}</span></p>  */}
                                <p><span className="doc">25 Bài học</span></p>
                                <p>{item.abstract} </p>
                                <ul>
                                <li><span className="ion-ios-checkmark" />Lý thuyết</li>
                                <li><span className="ion-ios-checkmark" />Thực hành</li>
                                <li><span className="ion-ios-checkmark" />Thi thử</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            });
            elements_list = userPage.list.map((item, index) => {
                const link = item.link ? linkFormat + item.link : idFormat + item._id;
                return (
                    <div className='container'>
                        <div className='col-12' key={index}>
                            <div className='row'>
                                <div style={{ width: '150px', padding: '15px' }} className={(index < userPage.list.length - 1 ? 'border-bottom' : '')}>
                                    <Link to={link}>
                                        <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid'/>
                                    </Link>
                                </div>
                                <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={(index < userPage.list.length - 1 ? ' border-bottom' : '')}>
                                    <div className='text'>
                                        <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                            <h2 className='heading pb-0 mb-0'>
                                                <Link to={link} className='text-primary'>{item.title}</Link>
                                            </h2>
                                            <p style={{ fontSize: '13px', height: '75px', overflow: 'hidden' }}>{item.abstract}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        
        return (
            <section>
                <div className="hero-wrap" style={{backgroundImage: 'url("images/bg_6.jpg")', backgroundAttachment: 'fixed'}}>
                    <div className="overlay" />
                    <div className="container-fluid">
                    <div className="row no-gutters slider-text align-items-center justify-content-center" data-scrollax-parent="true">
                        <div className="col-md-8 ftco-animate text-center">
                        <p className="breadcrumbs"><span className="mr-2"><a href="index.html">Trang chủ</a></span> <span>Khóa học</span></p>
                        <h1 className="mb-3 bread">Khóa Học</h1>
                        </div>
                    </div>
                    </div>
                </div>
                <div className='mb-15 text-right'>
                    <div className='btn-group'>
                        <button
                            className={'btn btn-sm ' + (this.state.viewMode == 'list' ? ' btn-primary' : 'btn-secondary')}
                            onClick={(e) => this.setViewMode(e, 'list')}><i className='fa fa-bars' aria-hidden='true'/>
                        </button>
                        <button
                            className={'btn btn-sm ' + (this.state.viewMode == 'grid' ? 'btn-primary' : 'btn-secondary')}
                            onClick={(e) => this.setViewMode(e, 'grid')}><i className='fa fa-th' aria-hidden='true'/>
                        </button>
                    </div>
                </div>
                <div className='container'>
                    <div className='row'>
                        {(this.state.viewMode == 'list') ? elements_list : elements_grid}
                        {(userPage && userPage.pageNumber < userPage.pageTotal) ? (
                            <div style={{width: '100%', textAlign: 'center'}}>
                                <img alt='Loading' className='listViewLoading' src='/img/loading.gif' style={{width: '48px', height: 'auto'}} onLoad={this.ready}/>
                            </div>
                        ) : ''}
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseInPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(CourseListView);