// @ts-check

export default {
  translation: {
    description: 'Описание',
    labels: 'Метки',
    statusId: 'Статус',
    executorId: 'Исполнитель',
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
          taskError: 'Не удалось удалить, у пользователя есть активные задачи',
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
        update: {
          success: 'Статус успешно обновлен',
          error: 'Не удалось изменить статус',
        },
        delete: {
          success: 'Статус успешно удален',
          error: 'Не удалось удалить статус',
          taskError: 'Это статус закреплен за задачей!',
        },
      },
      tasks: {
        delete: {
          success: 'Задача успешно удалена',
          rootError: 'Удалить задачу может только создатель',
        },
        create: {
          success: 'Задача успешно создана',
          error: 'Не удалось создать задачу',
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
        tasks: 'Задачи',
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
        edit: {
          submit: 'Изменить',
          title: 'Изменение статуса',
        },
        id: 'ID',
        header: 'Статусы',
        name: 'Наименование',
        created_at: 'Дата создания',
      },
      tasks: {
        id: 'ID',
        header: 'Задачи',
        name: 'Наименование',
        status: 'Статус',
        author: 'Автор',
        executor: 'Исполнитель',
        description: 'Описание',
        noDescription: '---',
        created_at: 'Дата создания',
        new: {
          created_button: 'Создать задачу',
          created_task: 'Создание задачи',
          submit: 'Создать',
          description: 'Описание',
          status: 'Статус',
          labels: 'Метки',
          executor: 'Исполнитель',
          noExecutor: '',
        },
        edit: {
          title: 'Изменение задачи',
          submit: 'Изменить',
        },
        delete: {
          submit: 'Удалить',
        },
      },
    },
  },
};
