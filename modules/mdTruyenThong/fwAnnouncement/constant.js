export const typeMapper = {
    enroll:{text:'Thông báo chiêu sinh'},
    emergency:{text:'Thông báo khẩn cấp'},
};

export const typeOptions = Object.entries(typeMapper).map(([key, value]) => ({ id: key, text: value.text }));