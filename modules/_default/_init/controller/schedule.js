module.exports = (app) => {
    app.readyHooks.add('schedule', {
        ready: () => app.database.redisDB,
        run: () => {
            // Thực hiện task lúc nửa đêm
            app.schedule('0 0 * * *', () => {
                // Cập nhật biến đếm ngày hôm nay về 0
                if (app.primaryWorker) app.database.redisDB.set(`${app.appName}:state:todayViews`, 0);

                // Dọn rác /temp/:dateFolderName cách 1 ngày
                if (app.primaryWorker) {
                    const tempPath = app.path.join(app.assetPath, '/temp'),
                        date = new Date(),
                        todayDirname = app.date.getDateFolderName(date);
                    date.setDate(date.getDate() - 1);
                    const yesterdayDirname = app.date.getDateFolderName(date);

                    app.fs.readdirSync(tempPath, { withFileTypes: true }).forEach(item => {
                        if (item.isDirectory() && item.name != todayDirname && item.name != yesterdayDirname) {
                            app.deleteFolder(app.path.join(tempPath, item.name));
                        }
                    });
                }

                // Hủy đăng ký lịch học của học viên cách 1 ngày
                if (app.primaryWorker) {
                    app.model.timeTable.getAll({ state: 'waiting' }, (error, items) => {
                        let timeTables = [];
                        (items || []).forEach(item => {
                            const expiredDate = new Date(item.createdAt).getTime() + 1000 * 3600 * 24;
                            const now = new Date().getTime();
                            if (expiredDate < now) {
                                timeTables.push(item);
                            }
                        });
                        if (timeTables && timeTables.length) {
                            const handleDeleteTimeTable = (index = 0) => {
                                if (index == timeTables.length) {
                                    return;
                                } else {
                                    const timeTable = timeTables[index];
                                    app.model.timeTable.update(timeTable._id, { state: 'autoCancel' }, () => {
                                        handleDeleteTimeTable(index + 1);
                                    });
                                }
                            };
                            handleDeleteTimeTable();
                        }
                    });
                }
                app.model.user.getOld((error, data) => {
                    const yearStart = data && data[0] && data[0].createdDate && data[0].createdDate.getFullYear();
                    const yearEnd = new Date().getFullYear();
                    const promiseList = [];
                    let totalTeacher = 0;
                    for (let year = yearStart; year <= yearEnd; year++) {
                        promiseList.push(
                            new Promise((resolve, reject) => {
                                app.model.user.count({ isLecturer: true, createdDate: { $gte: new Date().setFullYear(year, 0, 1), $lt: new Date().setFullYear(year + 1, 0, -1) } }, (error, numberOfTeacher) => {
                                    if (error) {
                                        reject(error);
                                    } else {
                                        app.model.user.count({ isLecturer: true, daNghiDay: true, ngayNghiDay: { $gte: new Date().setFullYear(year, 0, 1), $lt: new Date().setFullYear(year + 1, 0, -1) } }, (error, numberOfRemoveTeacher) => {
                                            if (error) {
                                                reject(error);
                                            } else {
                                                const obj = {};
                                                totalTeacher = totalTeacher + numberOfTeacher - numberOfRemoveTeacher;
                                                obj[year] = 'totalTeacher:' + totalTeacher + ':newTeacher:' + numberOfTeacher + ':removeTeacher:' + numberOfRemoveTeacher;
                                                resolve(obj);
                                            }
                                        });
                                    }
                                });
                            }));
                    }
                    promiseList && Promise.all(promiseList).then(item => {
                        const data = {};
                        let value = '';
                        if (item && item.length) {
                            item.forEach(teacher => {
                                value = value + Object.keys(teacher)[0] + ':' + Object.values(teacher)[0] + ';';
                            });
                        }
                        data.teacher = value;
                        app.model.setting.set(data);
                    }).catch(error => console.error(error));
                });
            });
            app.schedule('0 6 * * *', () => {
                // const axios = require('axios');
                // Tìm và gửi thông báo chúc mừng sinh nhật học viên
                // if (app.primaryWorker) {
                //     app.model.user.getAll({$expr:{$eq: [{$dayOfYear: new Date()}, {$dayOfYear: '$birthday'}]}}, (error, items) => {
                //         if (items && items.length) {
                //             const handleNotificationUser = (index = 0) => {
                //                 if (index == items.length) {
                //                     return;
                //                 } else {
                //                     const user = items[index];
                //                     const currentDay = new Date().getDate();
                //                     const currentMonth = new Date.getMonth();
                //                     if(user && user.birthday && (user.birthday.getDate() == currentDay) && (user.birthday.getMonth() == currentMonth)){
                //                         axios.post('https://fcm.googleapis.com/fcm/send', {
                //                             notification: {
                //                                 title: 'Chúc mừng sinh nhật',
                //                                 // type: item.type,
                //                                 body: 'Trung tâm đào tạo lái xe Hiệp Phát chúc mừng sinh nhật bạn!',
                //                                 mutable_content: true,
                //                                 sound: 'Tri-tone'
                //                             },
                //                             to: user.fcmToken 
                //                         },
                //                         {
                //                             headers: {
                //                                 Authorization: 'key=AAAAyyg1JDc:APA91bGhj8NFiemEgwLCesYoQcbGOiZ0KX2qbc7Ir7sFnANrypzIpniGsVZB9xS8ZtAkRrYqLCi5QhFGp32cKjsK_taIIXrkGktBrCZk7u0cphZ1hjI_QXFGRELhQQ_55xdYccZvmZWg'
                //                             }
                //                         }
                //                         );
                //                     } 
                //                     handleNotificationUser(index+1);
                //                 }
                //             };
                //             handleNotificationUser();
                //         }
                //     });
                // }
                // Tìm và gửi thông báo lịch học/ dạy
                // if(app.primaryWorker){
                //     const today = new Date();
                //     let tomorrow =  new Date();
                //         tomorrow.setDate(today.getDate() + 1);
                //     const promiseList = [];
                //     const getStudents = new Promise((resolve,reject)=>{ 
                //         app.model.timeTable.getAll({ date: {$gte: today, $lt: tomorrow}, state: 'approved'},  (error, items) => {
                //             const listStudent = {};
                //             items.forEach(item => {
                //                 const fcmToken = item.student && item.student.user ? item.student.user.fcmToken : null;
                //                 if(fcmToken && listStudent[fcmToken]){
                //                     listStudent[fcmToken] = listStudent[fcmToken] + ', ' + item.startHour;
                //                 } else if(fcmToken) {
                //                     listStudent[fcmToken] = [item.startHour];
                //                 }
                //             });
                //             resolve(listStudent);
                //         });
                //     });
                //     const getTeachers = new Promise((resolve,reject)=>{ 
                //         app.model.timeTable.getAll({ date: {$gte: today, $lt: tomorrow}, state: 'approved'},  (error, items) => {
                //             const listTeacher = {};
                //             items.forEach(item => {
                //                 console.log(item)
                //             });
                //             resolve(listTeacher);
                //         });
                //     });
                //     Promise.all([getTeachers,getStudents]).then(([listTeacher,listStudent]) => {
                //         let list = {...listTeacher, ...listStudent}; 
                //         const listFcmToken = Object.keys(list);
                //         const handleNotificationStudent = (index = 0) => {
                //             if (index == listFcmToken.length) {
                //                 return;
                //             } else {
                //                 const fcmToken = listFcmToken[index];
                //                 axios.post('https://fcm.googleapis.com/fcm/send', {
                //                     notification: {
                //                         title: 'Thông báo thời khoá biểu hôm nay',
                //                         // type: item.type,
                //                         body: 'Bạn có thời khoá biểu học thực hành vào các khung giờ ' + listStudent[fcmToken],
                //                         mutable_content: true,
                //                         sound: 'Tri-tone'
                //                     },
                //                     to: fcmToken 
                //                 },
                //                 {
                //                     headers: {
                //                         Authorization: 'key=AAAAyyg1JDc:APA91bGhj8NFiemEgwLCesYoQcbGOiZ0KX2qbc7Ir7sFnANrypzIpniGsVZB9xS8ZtAkRrYqLCi5QhFGp32cKjsK_taIIXrkGktBrCZk7u0cphZ1hjI_QXFGRELhQQ_55xdYccZvmZWg'
                //                     }
                //                 }
                //                 );
                //                 handleNotificationStudent(index + 1);
                //             }
                //         };
                //         handleNotificationStudent();
                //     }).catch(error => console.error(error));
                // }
            });
        },
    });
};