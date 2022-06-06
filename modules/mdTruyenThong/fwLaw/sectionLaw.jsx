import React from 'react';
import { connect } from 'react-redux';
import { getLawPageByUser } from './redux';
import inView from 'in-view';
import { Link } from 'react-router-dom';
import './law.scss';

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
            if (!this.loading && this.props.getLawPageByUser && userPage && userPage.pageNumber < userPage.pageTotal) {
                this.loading = true;
                this.props.getLawPageByUser(userPage.pageNumber + 1, T.defaultUserPageSize, () => this.loading = false);
            }
        });
    }

    componentDidMount() {
        this.props.getLawPageByUser(1, T.defaultUserPageSize, () => this.loading = false);
    }

    setViewMode = (e, viewMode) => {
        e.preventDefault();
        this.setState({ viewMode: viewMode });
        T.cookie('viewMode', viewMode);
    }

    renderLaw = (item,index)=>{
        const link = `/law/${item._id}`;
        return (
            <div key={index} className='law row mb-3'>
                <div className="col-md-3">
                    <Link className='law-link' to={link}>
                        <img src={item.image||'img/avatar.jpg'} alt={item.title} />
                    </Link>
                </div>

                <div className="col-md-9 pl-0">
                    <Link to={link} className='btn btn-link text-dark pl-0'>
                        <h4>
                            {item.title}
                        </h4>
                    </Link>
                    <p  className='mb-4'>{item.abstract}</p>
                    <Link className='text-primary' to={link}><i className="fa fa-calendar text-primary" aria-hidden="true"></i> {T.dateToText(item.createdDate,'dd/mm/yyyy HH:mm')}</Link>
                </div>
            </div>
        );
         
    }

    render() {
        let userPage = this.props.law ? this.props.law.userPage : null, elements = [];
        if (userPage) {
            elements = userPage.list.map((item,index) => this.renderLaw(item,index));
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
                    <h2 className='text-center text-main'>Quy định pháp luật</h2>
                    <div className='row mt-4'>
                        <div className='col'>
                            {elements}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, law: state.communication.law });
const mapActionsToProps = { getLawPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionFaq);
