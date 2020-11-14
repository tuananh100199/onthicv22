import React from 'react';
import Category from '../_init/Category.jsx';

export default class CourseCategoryPage extends React.Component {
    componentDidMount() {
        T.ready();
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Khóa học: Danh mục</h1>
                </div>
                <Category type='course' uploadType='courseCategoryImage' />
            </main>
        );
    }
}