import React from 'react';
import Dropdown from './Dropdown';

export const OverlayLoading = (props) =>
    <React.Fragment>
        <div className='overlay' style={{ zIndex: 1000 }}>
            <div className='m-loader mr-4'>
                <svg className='m-circular' viewBox='25 25 50 50'>
                    <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                </svg>
            </div>
        </div>
        <h4 className='col-12 text-center'>{props.text}</h4>
    </React.Fragment>;

export default class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    pageNumberChanged = (e, pageNumber, pageCondition) => {
        if (this.props.done) {
            if (pageCondition) {
                this.props.getPage(pageNumber, null, pageCondition, this.props.done);
            } else {
                this.props.getPage(pageNumber, null, this.props.done);
            }
        } else {
            if (pageCondition) {
                this.props.getPage(pageNumber, null, pageCondition);
            } else {
                this.props.getPage(pageNumber, null);
            }
        }
        // this.props.getPage(pageNumber, null);
        e.preventDefault();
    }
    pageSizeChanged = (pageSize, pageCondition) => {
        if (this.props.done) {
            if (pageCondition) {
                this.props.getPage(null, pageSize, pageCondition, this.props.done);
            } else {
                this.props.getPage(null, pageSize, this.props.done);
            }
        } else {
            if (pageCondition) {
                this.props.getPage(null, pageSize, pageCondition);
            } else {
                this.props.getPage(null, pageSize);
            }
        }
        // this.props.getPage(null, pageSize);
    }

    render() {
        const pageCondition = this.props.pageCondition ? this.props.pageCondition : undefined;
        let pageItems = [], firstButton = '', lastButton = '';
        if (this.props.pageTotal > 1) {
            let minPageNumber = Math.max(this.props.pageNumber - 3, 1),
                maxPageNumber = Math.min(this.props.pageNumber + 3, this.props.pageTotal);
            if (minPageNumber + 6 > maxPageNumber) {
                maxPageNumber = Math.min(minPageNumber + 6, this.props.pageTotal);
            }
            if (maxPageNumber - 6 < minPageNumber) {
                minPageNumber = Math.max(1, maxPageNumber - 6)
            }
            for (let i = minPageNumber; i <= maxPageNumber; i++) {
                pageItems.push(
                    <li key={i} className={'page-item' + (this.props.pageNumber === i ? ' active' : '')}>
                        <a className='page-link' href='#' onClick={e => this.pageNumberChanged(e, i, pageCondition)}>{i}</a>
                    </li>
                );
            }

            firstButton = this.props.pageNumber === 1 ?
                <li className='page-item disabled'>
                    <a className='page-link' href='#' aria-label='Previous'>
                        <span aria-hidden='true'>&laquo;</span>
                        <span className='sr-only'>Previous</span>
                    </a>
                </li> :
                <li className='page-item'>
                    <a className='page-link' href='#' aria-label='Previous' onClick={e => this.pageNumberChanged(e, 1, pageCondition)}>
                        <span aria-hidden='true'>&laquo;</span>
                        <span className='sr-only'>Previous</span>
                    </a>
                </li>;

            lastButton = this.props.pageNumber === this.props.pageTotal ?
                <li className='page-item disabled'>
                    <a className='page-link' href='#' aria-label='Next'>
                        <span aria-hidden='true'>&raquo;</span>
                        <span className='sr-only'>Next</span>
                    </a>
                </li> :
                <li className='page-item'>
                    <a className='page-link' href='#' aria-label='Next' onClick={e => this.pageNumberChanged(e, this.props.pageTotal)}>
                        <span aria-hidden='true'>&raquo;</span>
                        <span className='sr-only'>Next</span>
                    </a>
                </li>;
        }

        const style = Object.assign({}, this.props.style ? this.props.style : {}, { width: '100%', display: 'flex', position: 'fixed', bottom: '10px' });
        return (
            <div style={style}>
                <Dropdown className='btn btn-info' text={this.props.pageSize} items={[25, 50, 100, 200]} onSelected={pageSize => this.pageSizeChanged(pageSize, pageCondition)} />
                <nav style={{ marginLeft: '10px' }}>
                    <ul className='pagination' style={{ marginBottom: 0 }}>
                        {firstButton}
                        {pageItems}
                        {lastButton}
                    </ul>
                </nav>
            </div>
        );
    }
}