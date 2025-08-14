export class Translate {
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
    static translate(text/*, context*/) {

        if (text === undefined) return '';

        const dict = {
            'ADD': 'Добавить',
            'ADD NEW RECORD': 'Добавить новую строку',
            'BUTTONS SIZE': 'Размер кнопок',
            'CANCEL': 'Отмена',
            'COLLAPSE': 'Свернуть',
            'COPY': 'Копировать',
            'COPY RECORD': 'Копировать строку',
            'CLEAR ALL FILTERS': 'Очистить все фильтры',
            'COMMIT': 'Сохранить',
            'COMMIT CHANGES': 'Сохранить изменения',
            'CURRENT PAGE': 'Текущая страница',
            'DEFAULT': 'По умолчанию',
            'DEFAULT THEME': 'Тема по умолчанию',
            'DELETE': 'Удалить',
            'DELETE RECORD': 'Удалить строку',
            'ERROR GETTING ROWS': 'Ошибка при получении строк',
            'EXPAND': 'Развернуть',
            'FIRST': 'К началу',
            'LARGE BUTTONS': 'Большие',
            'LAST': 'В конец',
            'LOAD MORE RECORDS': 'Загрузить еще строк',
            'MEDIUM BUTTONS': 'Средние',
            'MORE...': 'еще...',
            'NEXT': 'Следующая',
            'NEW CONFIGURATION': 'Новая конфигурация',
            'NO DATA DEFINED TO SAVE': 'Не опеределены данные для сохранения',
            'OF': 'из',
            'PAGE SIZE': 'Размер страницы',
            'PARAMETER': 'Параметр',
            'PREV': 'Предыдущая',
            'REFRESH': 'Обновить',
            'RESET COLUMNS ORDER': 'Сбросить порядок колонок',
            'RESET COLUMNS SORT': 'Сбросить сортировку колонок',
            'RESET COLUMNS WIDTHS': 'Сбросить ширину колонок',
            'ROLLBACK': 'Откатить',
            'ROLLBACK CHANGES': 'Откатить изменения',
            'SETTINGS': 'Настройки',
            'SELECT': 'Выбор',
            'SELECT VALUE': 'Выбрать значение',
            'SERVER TYPE': 'Тип сервера',
            'SMALL BUTTONS': 'Маленькие',
            'THEME': 'Тема',
            'TOTAL PAGES': 'Всего страниц',
            'TOTAL ROWS': 'Всего строк',
            'TREE': 'Дерево',
            'VALUE': 'Значение',
            'VIEW': 'Просмотр',
            'VIEW RECORD': 'Карточка',
        };
        return dict[text.toUpperCase()] || text;
    }
    // -------------------------------------------------------------------------------------------------------------------------------------------------------------
}