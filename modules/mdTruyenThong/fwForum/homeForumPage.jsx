import React from 'react';
import { connect } from 'react-redux';
import {getCategoryAll} from 'modules/_default/fwCategory/redux';
import Loading from 'view/component/Loading';
import CategoryForum from './components/CategoryForum';
import './forum.scss';

class HomeForumPage extends React.Component {
    state = {};
    loading = false;

    componentDidMount() {
        this.props.getCategoryAll('forum','',forumCategories=>this.setState({forumCategories}));
    }

    render() {
        const {forumCategories} = this.state;
        const content = forumCategories ?
        forumCategories.map(category=><CategoryForum key={category._id} category={category}/>):<Loading />;
        return (
            <div className='news' style={{marginTop:120,marginBottom:50}}>
                <p></p>
                <h2 className='text-center text-main'>Diễn đàn</h2>
                <div className='container'>
                    <div className='row'>
                            {content}
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, announcement: state.communication.announcement, category:state.framework.category });
const mapActionsToProps = { getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(HomeForumPage);