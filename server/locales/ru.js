// @ts-check

export default {
  translation: {
    name: 'Наименование',
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
          success: 'Пользователь успешно удалён',
          error: 'Не удалось удалить пользователя',
          taskError: 'Не удалось удалить, у пользователя есть активные задачи',
        },
        update: {
          success: 'Пользователь успешно изменён',
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
          success: 'Статус успешно изменён',
          error: 'Не удалось изменить статус',
        },
        delete: {
          success: 'Статус успешно удалён',
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
        update: {
          success: 'Задача успешно обновлена',
          error: 'Не удалось обновить задачу',
        },
      },
      labels: {
        create: {
          success: 'Метка успешно создана',
          error: 'Не удалось создать метку',
        },
        update: {
          success: 'Метка успешно изменена',
          error: 'Не удалось обновить метку',
        },
        delete: {
          success: 'Метка успешно удалена',
          error: 'Не удалось удалить метку',
          taskError: 'Не удалось удалить метку, есть связанные задачи',
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
        labels: 'Метки',
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
        label: 'Метка',
        myTasks: 'Только мои задачи',
        author: 'Автор',
        executor: 'Исполнитель',
        description: 'Описание',
        noDescription: '---',
        created_at: 'Дата создания',
        filter: 'Показать',
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
      labels: {
        header: 'Метки',
        id: 'ID',
        name: 'Наименование',
        created_at: 'Дата создания',
        new: {
          created_button: 'Создать метку',
          created_label: 'Создание метки',
          submit: 'Создать',
          name: 'наименование',
        },
        edit: {
          submit: 'Изменить',
          title: 'Изменение статуса',
        },
      },
    },
  },
};
