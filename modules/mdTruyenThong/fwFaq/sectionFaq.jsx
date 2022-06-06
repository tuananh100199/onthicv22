import React from 'react';
import { connect } from 'react-redux';
import { getFaqPageByUser } from './redux';
import inView from 'in-view';
import './faq.scss';

class Faq extends React.Component {
    state = {show:false};

    render() {
        const item = this.props.faq,show = this.state.show;

        return (
            <div key={item._id} className='faq'>
            <h3 className='d-flex justify-content-between'>
                <div className='d-flex align-items-center'>
                <i className={`fa fa-question-circle-o faq--title ${show?'text-main':''}`} aria-hidden="true"></i>
                <a className={`btn btn-link faq--title ${show?'text-main':''}`} style={{whiteSpace:'normal'}} data-toggle="collapse" href={`#collapse${item._id}`}  role="button"
                onClick={()=>this.setState({show:!show})} aria-expanded="false" aria-controls={`collapse${item._id}`}>
                    {item.title}
                </a>
                </div>
                

                <a className={`btn btn-link faq--title ${show?'text-main':''}`} data-toggle="collapse" href={`#collapse${item._id}`}  role="button"
                onClick={()=>this.setState({show:!show})} aria-expanded="false" aria-controls={`collapse${item._id}`}>
                    <i className={`fa ${this.state.show?'fa-minus':'fa-plus'}`} aria-hidden="true"></i>
                </a>
            </h3>
            <div className="collapse" id={`collapse${item._id}`}>
            <p dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
        </div>
        );
    }
}

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
            let userPage = this.props.faq.userPage;
            if (!this.loading && this.props.getFaqPageByUser && userPage && userPage.pageNumber < userPage.pageTotal) {
                this.loading = true;
                this.props.getFaqPageByUser(userPage.pageNumber + 1, T.defaultUserPageSize, () => this.loading = false);
            }
        });
    }

    componentDidMount() {
        this.props.getFaqPageByUser(1, T.defaultUserPageSize, () => this.loading = false);
    }

    setViewMode = (e, viewMode) => {
        e.preventDefault();
        this.setState({ viewMode: viewMode });
        T.cookie('viewMode', viewMode);
    }

    renderFaq = (item,index)=>(
        <div key={index} className='faq'>
            <h3>
                <a className="btn btn-link faq--title" data-toggle="collapse" href={`#collapse${item._id}`} role="button" aria-expanded="false" aria-controls={`collapse${item._id}`}>
                    {item.title}
                </a>
            </h3>
            <div className="collapse" id={`collapse${item._id}`}>
            <p dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
        </div>
    )

    render() {
        let userPage = this.props.faq ? this.props.faq.userPage : null, elements = [];
        if (userPage) {
            elements = userPage.list.map((item,index) => (<Faq key={index} faq={item}/>)    );
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
            <div className='blog'>
                <div className='container'>
                    <h2 className='text-center text-main'>Câu hỏi thường gặp</h2>
                    <div className='row'>
                        <div className='col'>
                            {elements}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, faq: state.communication.faq });
const mapActionsToProps = { getFaqPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionFaq);