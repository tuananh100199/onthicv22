import React from 'react';
import Category from 'modules/_default/_init/Category';

export default class NewsCategoryPage extends React.Component {
    componentDidMount() {
        T.ready();
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Danh mục tin tức</h1>
                </div>
                <Category type='news' uploadType='newsCategoryImage' />
            </main>
        );
    }
}