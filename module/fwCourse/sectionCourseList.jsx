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
        this.props.getCourseInPageByUser(1, T.defaultUserPageSize, () => {
            T.ftcoAnimate()
            this.loading = false
        });
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
        this.setState({ viewMode }, T.ftcoAnimate)
    }
    
    render() {
        let userPage = this.props.course ? this.props.course.userPage : null,
            elements_grid = [],
            elements_list = [];
        if (userPage) {
            elements_grid = userPage.list.map((item, index) => {
                let { image, title, abstract } = item ? item : { image: '', title: '', abstract: '' };
                const link = item.link ? linkFormat + item.link : idFormat + item._id;
                return (
                    <div className='col-lg-4 col-md-6 col-12 team_col ftco-animate' key={index}>
                        <div className='team_item text-center d-flex flex-column aling-items-center justify-content-end'>
                            <div className='team_image'><Link to={link}><img src={image} alt={title} /></Link></div>
                            <div className='team_content text-center'>
                                <div className='team_name'><Link to={link}>{title}</Link></div>
                                {/*<div className='team_title'>Plastic Surgeon</div>*/}
                                <div className='team_text'>
                                    <p>{abstract}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
            elements_list = userPage.list.map((item, index) => {
                const link = item.link ? linkFormat + item.link : idFormat + item._id;
                return (
                    <div key={index} className='row ml-0 ftco-animate'>
                        <div style={{ width: '150px', padding: '15px 15px 15px 0px' }} className={index < userPage.list.length - 1 ? 'border-bottom' : ''}>
                            <Link to={link}>
                                <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                            </Link>
                        </div>
                        <div style={{ width: 'calc(100% - 165px)', marginRight: '15px', paddingTop: '15px' }} className={index < userPage.list.length - 1 ? 'border-bottom' : ''}>
                            <div className='text'>
                                <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                    <Link to={link}><div className='contact_content_title mt-0'>{item.title}</div></Link>
                                    <div className='contact_content_text'>
                                        <p className='text-justify'>{item.abstract}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        
        return (
            <div className='contact' style={{ marginTop: '110px' }}>
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
    
                {(this.state.viewMode == 'list') ? (
                    <div className='container'>
                        <div className='mt-2'>
                            <div>{elements_list}</div>
                        </div>
                    </div>
                ) : (
                    <div className='container'>
                        <div className='row team_row'>
                            {elements_grid}
                        </div>
                    </div>
                )}
                
                {(userPage && userPage.pageNumber < userPage.pageTotal) ? (
                    <div style={{width: '100%', textAlign: 'center'}}>
                        <img alt='Loading' className='listViewLoading' src='/img/loading.gif' style={{width: '48px', height: 'auto'}} onLoad={this.ready}/>
                    </div>
                ) : ''}
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseInPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(CourseListView);