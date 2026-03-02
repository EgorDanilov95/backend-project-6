// @ts-check

export default {
  translation: {
    firstName: 'Имя',
    lastName: 'Фамилия',
    password: 'Пароль',
    email: 'Email',
    appName: 'Менеджер задач',
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        notAllowed: 'Вы не можете редактировать другого пользователя',
        delete: {
          success: 'Пользователь успешно удален',
          error: 'Не удалось удалить пользователя',
        },
        update: {
          success: 'Пользователь успешно изменен',
          error: 'Возникла ошибка при обновлении',
        },
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
      statuses: {
        create: {
          success: 'Статус успешно создан',
          error: 'Не удалось создать статус',
        },
      },
    },
    layouts: {
      application: {
        users: 'Пользователи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
        statuses: 'Статусы',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        actions: 'Действия',
        fullName: 'Полное имя',
        id: 'ID',
        email: 'Email',
        createdAt: 'Дата создания',
        new: {
          submit: 'Сохранить',
          signUp: 'Регистрация',
        },
        edit: {
          submit: 'Изменить',
          title: 'Изменение пользователя',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      statuses: {
        new: {
          created_status: 'Создание статуса',
          created_button: 'Создать статус',
          submit: 'Создать',
          name: 'Наименование',
        },
        id: 'ID',
        header: 'Статусы',
        name: 'Наименование',
        createdAt: 'Дата создания',
      },
    },
  },
};
