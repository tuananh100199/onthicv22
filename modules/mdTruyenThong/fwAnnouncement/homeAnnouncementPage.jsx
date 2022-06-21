import React from 'react';
import { connect } from 'react-redux';
import { getAnnouncementPageByUser } from './redux';
import { Link } from 'react-router-dom';
import inView from 'in-view';

const linkFormat = '/thong-bao/', idFormat = '/announcement/';

class SectionNewsList extends React.Component {
    state = {};
    loading = false;

    constructor(props) {
        super(props);
        this.state = {
            viewMode: (T.cookie('viewMode') ? T.cookie('viewMode') : 'grid')
        };
    }

    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let userPage = this.props.news.userPage;
            if (!this.loading && this.props.getAnnouncementPageByUser && userPage && userPage.pageNumber < userPage.pageTotal) {
                this.loading = true;
                this.props.getAnnouncementPageByUser(userPage.pageNumber + 1, T.defaultUserPageSize, () =>{
                    this.loading = false;
                    T.ftcoAnimate();    
                } );
            }
        });
    }

    componentDidMount() {
        this.props.getAnnouncementPageByUser(1, T.defaultUserPageSize, () =>{
            this.loading = false;
            T.ftcoAnimate();    
        });
    }

    setViewMode = (e, viewMode) => {
        e.preventDefault();
        this.setState({ viewMode: viewMode });
        T.cookie('viewMode', viewMode);
    }

    renderNews = (item,index)=>{
        const link = item.link ? linkFormat + item.link : idFormat + item._id;
        return (
            <div key={index} className='ftco-animate col-md-3 mt-3 mb-3'>
                <div className='wrap_item wrap-shadow ml-1 mr-1'>
                    <div className='team_item text-center'>
                        <Link className='news_link' to={link}>
                            <div className="news_image">
                                <img src={item.image} alt='image' />
                            </div>
                        </Link>
                        
                        <div className='news_content text-justify justify-content-start'>
                                <Link className='text-primary' to={link}><i className="fa fa-calendar text-primary" aria-hidden="true"></i> {T.dateToText(item.createdDate,'dd/mm/yyyy HH:mm')}</Link>
                                <h5><Link className='text-dark' to={link}>{item.title}</Link></h5>
                                <blockquote>
                                    <p>&ldquo;{item.abstract}&rdquo;</p>
                                </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        let userPage = this.props.announcement ? this.props.announcement.userPage : null, elements = [];
        if (userPage) {
            elements = userPage.list.map((item, index) => this.renderNews(item,index));
        }

        if (userPage && userPage.pageNumber < userPage.pageTotal) {
            elements.push(
                <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img alt='Loading' className='listViewLoading' src='/img/loading.gif'
                        style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
        }
        return (
            <div className='news' style={{marginTop:120,marginBottom:50}}>
                <p></p>
                <h2 className='text-center text-main'>Thông báo</h2>
                <div className='container-fluid'>
                    <div className='row'>
                            {elements}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, announcement: state.communication.announcement });
const mapActionsToProps = { getAnnouncementPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionNewsList);