import React from 'react';
import { connect } from 'react-redux';
import { getForumHomePage } from './redux';
import inView from 'in-view';
import './forum.scss';
import ForumItem from './components/ForumItem';
class SectionFaq extends React.Component {
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
            let userForumPage = this.props.forum.userForumPage;
            if (!this.loading && this.props.getForumHomePage && userForumPage && userForumPage.pageNumber < userForumPage.pageTotal) {
                this.loading = true;
                this.props.getForumHomePage(userForumPage.pageNumber + 1, T.defaultUserPageSize,{categoryId:this.state._id}, () => this.loading = false);
            }
        });
    }

    componentDidMount() {
        const route = T.routeMatcher('/forums/:_id'),
        params = route.parse(window.location.pathname);
        if(params && params._id){
            this.setState({ _id: params._id });
            this.props.getForumHomePage(1, T.defaultUserPageSize,{categoryId:params._id}, () => this.loading = false);
        }else{
            this.props.history.push('/forums');
        }
    }

    setViewMode = (e, viewMode) => {
        e.preventDefault();
        this.setState({ viewMode: viewMode });
        T.cookie('viewMode', viewMode);
    }

    render() {
        let {userForumPage=null,category} = this.props.forum, elements = [];
        if (userForumPage) {
            elements = userForumPage.list.map((item,index) => <ForumItem item={item} key={index}/>);
        }
        if (userForumPage && userForumPage.pageNumber < userForumPage.pageTotal) {
            elements.push(
                <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img alt='Loading' className='listViewLoading' src='/img/loading.gif'
                        style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
        }

        return (
                <div className='container' style={{marginTop:120,marginBottom:50}}>
                    <h2 className='text-center text-main'>Diễn đàn: {category ?category.title:'...'}</h2>
                    <div className='row mt-4'>
                        <div className='col'>
                            {elements.length ? elements:'Chưa có bài viết nào'}
                        </div>
                    </div>
                </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumHomePage };
export default connect(mapStateToProps, mapActionsToProps)(SectionFaq);
