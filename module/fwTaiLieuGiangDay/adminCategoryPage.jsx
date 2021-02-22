import React from 'react';
import Category from '../_init/Category.jsx';

export default class DocumentCategoryPage extends React.Component {
    componentDidMount() {
        T.ready();
        console.log('object')
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Tài liệu giảng dạy: Danh mục</h1>
                </div>
                {/* <Category type='document' uploadType='documentCategoryImage' /> */}
            </main>
        );
    }
}